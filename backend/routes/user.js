import { Router } from 'express';
import { protect } from '../middleware/auth.js';

export const userRouter = Router();
userRouter.use(protect);
userRouter.get('/profile', (req, res) => res.json({ success: true, user: req.user }));
