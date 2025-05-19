import User from '../models/userModel.js';
import bcrypt from 'bcrypt';

async function registerUser(req, res) {
    const user = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      
    try {
        // בדיקה אם המשתמש כבר קיים
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // יצירת משתמש חדש
        const newUser = new User({
            name: user.name,
            email: user.email,
            password: hashedPassword,
            linkedEmails: user.linkedEmails,
            privacyAccepted: user.privacyAccepted,
            registrationDate: user.registrationDate
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        // בדיקת משתמש וסיסמה
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'email not found in system' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.status(200).json({ message: 'User logged in successfully', user });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Error logging' });
    }
}

export { registerUser, loginUser };