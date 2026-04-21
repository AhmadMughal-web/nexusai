import { Router } from 'express';
import { signup, login, guestLogin, forgotPassword, resetPassword, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/guest', guestLogin);
authRouter.post('/forgot-password', forgotPassword);
authRouter.patch('/reset-password/:token', resetPassword);
authRouter.get('/me', protect, getMe);
