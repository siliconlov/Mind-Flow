import express from 'express';
import { chatWithAI } from '../controllers/chat';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, chatWithAI);

export default router;
