import express from 'express';
import { startMonitoring, stopMonitoring, getContainerStatus } from '../controllers/monitorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start',authenticateToken, startMonitoring);
router.post('/stop', authenticateToken,stopMonitoring );
router.get('/status', authenticateToken, getContainerStatus);
export default router;