import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { inMemoryDB, isMongoConnected } from '../config/db.js';
import { sendResetEmail } from '../utils/mailer.js';

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendSuccess = (res, statusCode, user, token) =>
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id || user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      isGuest: user.isGuest || false,
    },
  });

// ══════════════════════════════════════════════
// GUEST LOGIN
// ══════════════════════════════════════════════
export async function guestLogin(req, res) {
  try {
    const token = signToken('guest');
    res.json({
      success: true,
      token,
      user: { id: 'guest', name: 'Guest Explorer', username: 'guest', email: '', isGuest: true },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ══════════════════════════════════════════════
// SIGNUP
// ══════════════════════════════════════════════
export async function signup(req, res) {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    if (name.trim().length < 2)
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    if (username.length < 3)
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
    if (!/^[a-z0-9_]+$/i.test(username))
      return res.status(400).json({ success: false, message: 'Username: only letters, numbers, underscores.' });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ success: false, message: 'Please enter a valid email.' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    if (isMongoConnected) {
      const existing = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      });
      if (existing) {
        if (existing.email === email.toLowerCase())
          return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return res.status(409).json({ success: false, message: 'This username is already taken.' });
      }
      const user = await User.create({
        name: name.trim(),
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
      });
      return sendSuccess(res, 201, user.toSafeObject(), signToken(user._id));
    } else {
      for (const u of inMemoryDB.users.values()) {
        if (u.email === email.toLowerCase())
          return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        if (u.username === username.toLowerCase())
          return res.status(409).json({ success: false, message: 'This username is already taken.' });
      }
      const id = 'user_' + Date.now();
      const hashed = await bcrypt.hash(password, 12);
      const user = {
        id, name: name.trim(),
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashed,
        createdAt: new Date().toISOString(),
      };
      inMemoryDB.users.set(id, user);
      return sendSuccess(res, 201, user, signToken(id));
    }
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ success: false, message: 'Signup failed. Please try again.' });
  }
}

// ══════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════
export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password)
      return res.status(400).json({ success: false, message: 'Email/username and password are required.' });

    if (isMongoConnected) {
      const user = await User.findOne({
        $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
      }).select('+password');

      if (!user)
        return res.status(401).json({ success: false, message: 'No account found with this email or username.' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
      return sendSuccess(res, 200, user.toSafeObject(), signToken(user._id));
    } else {
      const users = Array.from(inMemoryDB.users.values());
      const user = users.find(
        u => u.email === identifier.toLowerCase() || u.username === identifier.toLowerCase()
      );
      if (!user)
        return res.status(401).json({ success: false, message: 'No account found with this email or username.' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });

      return sendSuccess(res, 200, user, signToken(user.id));
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
}

// ══════════════════════════════════════════════
// FORGOT PASSWORD
// ══════════════════════════════════════════════
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Email is required.' });

    const successMsg = `If an account exists for ${email}, a password reset link has been sent.`;

    if (isMongoConnected) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save({ validateBeforeSave: false });
        const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
        await sendResetEmail(user.email, user.name, resetURL);
      }
    } else {
      const user = Array.from(inMemoryDB.users.values()).find(u => u.email === email.toLowerCase());
      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const hashed = crypto.createHash('sha256').update(token).digest('hex');
        inMemoryDB.tokens.set(hashed, { userId: user.id, expires: Date.now() + 15 * 60 * 1000 });
        const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
        await sendResetEmail(user.email, user.name, resetURL);
      }
    }

    res.json({ success: true, message: successMsg });
  } catch (err) {
    console.error('ForgotPassword error:', err.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
}

// ══════════════════════════════════════════════
// RESET PASSWORD
// ══════════════════════════════════════════════
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (isMongoConnected) {
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user)
        return res.status(400).json({ success: false, message: 'Reset link is invalid or expired.' });
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return sendSuccess(res, 200, user.toSafeObject(), signToken(user._id));
    } else {
      const record = inMemoryDB.tokens.get(hashedToken);
      if (!record || record.expires < Date.now())
        return res.status(400).json({ success: false, message: 'Reset link is invalid or expired.' });
      const user = inMemoryDB.users.get(record.userId);
      if (!user)
        return res.status(400).json({ success: false, message: 'User not found.' });
      user.password = await bcrypt.hash(password, 12);
      inMemoryDB.tokens.delete(hashedToken);
      return sendSuccess(res, 200, user, signToken(user.id));
    }
  } catch (err) {
    console.error('ResetPassword error:', err.message);
    res.status(500).json({ success: false, message: 'Reset failed. Please try again.' });
  }
}

// ══════════════════════════════════════════════
// GET ME
// ══════════════════════════════════════════════
export async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}
