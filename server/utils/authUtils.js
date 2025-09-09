import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export function generateToken(user) {
    return jwt.sign(
        { phone: user.phone }, 
        SECRET_KEY, 
        { expiresIn: EXPIRES_IN }
    );
}


export function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        throw new Error('Invalid or expired token', error);
    }
}