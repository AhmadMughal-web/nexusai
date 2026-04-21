import jwt from 'jsonwebtoken';
import { inMemoryDB, isMongoConnected } from '../config/db.js';
import { User } from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    }

    // ── Guest user ──────────────────────────────
    if (decoded.id === 'guest') {
      req.user = { id: 'guest', name: 'Guest Explorer', username: 'guest', isGuest: true };
      return next();
    }

    // ── Logged in user ──────────────────────────
    if (isMongoConnected) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists.' });
      }
      req.user = user.toSafeObject();
    } else {
      // In-memory DB — agar server restart hua to user gayab ho jata hai
      // Is case mein user ko gracefully logout karo
      const user = inMemoryDB.users.get(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Server restart hua — please login karein dobara.',
        });
      }
      const { password, ...safeUser } = user;
      req.user = safeUser;
    }

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err.message);
    return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
  }
}
