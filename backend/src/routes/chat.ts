import { Router } from 'express';
import { handleChat } from '../controllers/chatController';

const router = Router();

// Endpoint trò chuyện / hỏi đáp AI
router.post('/', handleChat);

export default router;
