import { verifyToken } from '../utils/authUtils.js';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = verifyToken(token); 
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token',error});
    }
}