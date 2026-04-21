import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

export const userRouter = Router();

userRouter.use(protect);
userRouter.get('/profile', getProfile);
userRouter.patch('/profile', updateProfile);
