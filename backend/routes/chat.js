import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { sendMessage, createChat, getChats, getChat, deleteChat, updateChatTitle } from '../controllers/chatController.js';

export const chatRouter = Router();
chatRouter.use(protect);
chatRouter.post('/message',       sendMessage);
chatRouter.post('/',              createChat);
chatRouter.get('/',               getChats);
chatRouter.get('/:chatId',        getChat);
chatRouter.delete('/:chatId',     deleteChat);
chatRouter.patch('/:chatId/title', updateChatTitle);
