import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { memDB, mongoConnected } from '../config/db.js';
import { sendResetEmail } from '../utils/mailer.js';

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const ok = (res, code, user, token) => res.status(code).json({
  success: true, token,
  user: { id: user.id || user._id, name: user.name, username: user.username, email: user.email, isGuest: false },
});

// ── GUEST ─────────────────────────────────────
export async function guestLogin(req, res) {
  res.json({
    success: true,
    token: sign('guest'),
    user: { id: 'guest', name: 'Guest Explorer', username: 'guest', email: '', isGuest: true },
  });
}

// ── SIGNUP ────────────────────────────────────
export async function signup(req, res) {
  try {
    const { name, username, email, password } = req.body;

    // Validation
    if (!name?.trim() || !username?.trim() || !email?.trim() || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    if (name.trim().length < 2)
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    if (username.length < 3 || !/^[a-z0-9_]+$/i.test(username))
      return res.status(400).json({ success: false, message: 'Username: 3+ chars, only letters/numbers/underscore.' });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    if (mongoConnected) {
      const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
      if (exists) {
        const msg = exists.email === email.toLowerCase()
          ? 'An account with this email already exists.'
          : 'This username is already taken.';
        return res.status(409).json({ success: false, message: msg });
      }
      const user = await User.create({ name: name.trim(), username: username.toLowerCase(), email: email.toLowerCase(), password });
      return ok(res, 201, user.safe(), sign(user._id));
    } else {
      for (const u of memDB.users.values()) {
        if (u.email === email.toLowerCase())
          return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        if (u.username === username.toLowerCase())
          return res.status(409).json({ success: false, message: 'This username is already taken.' });
      }
      const id = 'u_' + Date.now();
      const hashed = await bcrypt.hash(password, 12);
      const user = { id, name: name.trim(), username: username.toLowerCase(), email: email.toLowerCase(), password: hashed };
      memDB.users.set(id, user);
      return ok(res, 201, user, sign(id));
    }
  } catch (err) {
    console.error('[signup]', err.message);
    res.status(500).json({ success: false, message: 'Signup failed. Please try again.' });
  }
}

// ── LOGIN ─────────────────────────────────────
export async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier?.trim() || !password)
      return res.status(400).json({ success: false, message: 'Email/username and password are required.' });

    if (mongoConnected) {
      const user = await User.findOne({
        $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
      }).select('+password');
      if (!user)
        return res.status(401).json({ success: false, message: 'No account found with this email or username.' });
      const match = await user.checkPassword(password);
      if (!match)
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
      return ok(res, 200, user.safe(), sign(user._id));
    } else {
      const user = [...memDB.users.values()].find(
        u => u.email === identifier.toLowerCase() || u.username === identifier.toLowerCase()
      );
      if (!user)
        return res.status(401).json({ success: false, message: 'No account found with this email or username.' });
      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      return ok(res, 200, user, sign(user.id));
    }
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
}

// ── FORGOT PASSWORD ───────────────────────────
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email?.trim())
      return res.status(400).json({ success: false, message: 'Email is required.' });

    const token = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
    const expires = Date.now() + 15 * 60 * 1000; // 15 min

    if (mongoConnected) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.resetPasswordToken = hashed;
        user.resetPasswordExpires = new Date(expires);
        await user.save({ validateBeforeSave: false });
        await sendResetEmail(user.email, user.name, resetURL);
      }
    } else {
      const user = [...memDB.users.values()].find(u => u.email === email.toLowerCase());
      if (user) {
        memDB.tokens.set(hashed, { userId: user.id, expires });
        await sendResetEmail(user.email, user.name, resetURL);
      }
    }

    // Always return success (security best practice)
    res.json({ success: true, message: `If an account exists for ${email}, a reset link has been sent.` });
  } catch (err) {
    console.error('[forgotPassword]', err.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
}

// ── RESET PASSWORD ────────────────────────────
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    if (mongoConnected) {
      const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } });
      if (!user)
        return res.status(400).json({ success: false, message: 'Reset link is invalid or expired.' });
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return ok(res, 200, user.safe(), sign(user._id));
    } else {
      const record = memDB.tokens.get(hashed);
      if (!record || record.expires < Date.now())
        return res.status(400).json({ success: false, message: 'Reset link is invalid or expired.' });
      const user = memDB.users.get(record.userId);
      if (!user)
        return res.status(400).json({ success: false, message: 'User not found.' });
      user.password = await bcrypt.hash(password, 12);
      memDB.tokens.delete(hashed);
      return ok(res, 200, user, sign(user.id));
    }
  } catch (err) {
    console.error('[resetPassword]', err.message);
    res.status(500).json({ success: false, message: 'Reset failed. Please try again.' });
  }
}

// ── GET ME ────────────────────────────────────
export async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}
