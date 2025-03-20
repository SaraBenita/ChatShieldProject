import express from 'express';
import {
    sendMessage,
} from '../controllers/messageController.js';

const router = express.Router();


router.post('/send', sendMessage);

//http://localhost:5000/api/messages/send

export default router;