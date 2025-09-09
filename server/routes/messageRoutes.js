import express from 'express';
import {
    sendMessage,getMessagesByUser,getStatsByUser
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/send', authenticateToken, sendMessage);
router.get('/getMessages', authenticateToken, getMessagesByUser);
router.get('/stats', authenticateToken, getStatsByUser);

export default router;