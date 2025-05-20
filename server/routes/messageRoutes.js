import express from 'express';
import {
    sendMessage,getMessagesByUser
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();


// נתיב מוגן
router.post('/send', authenticateToken, sendMessage);
router.get('/getMessages', authenticateToken, getMessagesByUser);

export default router;