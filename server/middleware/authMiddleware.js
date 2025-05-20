import { verifyToken } from '../utils/authUtils.js';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // קבלת הטוקן מהכותרת Authorization

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = verifyToken(token); // אימות הטוקן
        req.user = decoded; // שמירת המידע מהטוקן בבקשה
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token',error});
    }
}