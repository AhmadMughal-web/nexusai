import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { memDB, mongoConnected } from '../config/db.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });

    const token = header.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      const msg = e.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid token. Please log in again.';
      return res.status(401).json({ success: false, message: msg });
    }

    // Guest shortcut
    if (decoded.id === 'guest') {
      req.user = { id: 'guest', name: 'Guest Explorer', username: 'guest', isGuest: true };
      return next();
    }

    // Real user
    let user;
    if (mongoConnected) {
      user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ success: false, message: 'Account not found. Please log in again.' });
      req.user = user.safe();
    } else {
      const u = memDB.users.get(decoded.id);
      if (!u) return res.status(401).json({ success: false, message: 'Session expired — server restarted. Please log in again.' });
      const { password, ...safe } = u;
      req.user = safe;
    }

    next();
  } catch (err) {
    console.error('[protect]', err.message);
    res.status(401).json({ success: false, message: 'Authentication failed.' });
  }
}
