import { User } from '../models/User.js';
import { inMemoryDB, isMongoConnected } from '../config/db.js';

export async function getProfile(req, res) {
  res.json({ success: true, user: req.user });
}

export async function updateProfile(req, res) {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (isMongoConnected) {
      const user = await User.findByIdAndUpdate(userId, { name }, { new: true, runValidators: true });
      return res.json({ success: true, user: user.toSafeObject() });
    } else {
      const user = inMemoryDB.users.get(userId);
      if (user) user.name = name;
      const { password, ...safeUser } = user || {};
      return res.json({ success: true, user: safeUser });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
