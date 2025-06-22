import express from 'express';
import {
    registerUserByExtension,loginUserByExtension,registerUserByDashboard,loginUserByDashboard,getUserProfile
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';


const router = express.Router();


router.post('/registerByExtension', registerUserByExtension);
router.post('/loginByExtension', loginUserByExtension);
router.post('/registerByDashboard', registerUserByDashboard);
router.post('/loginByDashboard', loginUserByDashboard);
router.get('/profile', authenticateToken, getUserProfile);
export default router;