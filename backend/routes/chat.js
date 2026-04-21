import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { sendMessage, createChat, getChats, getChat, deleteChat, updateChatTitle } from '../controllers/chatController.js';

export const chatRouter = Router();

chatRouter.use(protect);

chatRouter.post('/message', chatLimiter, sendMessage);
chatRouter.post('/', createChat);
chatRouter.get('/', getChats);
chatRouter.get('/:chatId', getChat);
chatRouter.delete('/:chatId', deleteChat);
chatRouter.patch('/:chatId/title', updateChatTitle);
