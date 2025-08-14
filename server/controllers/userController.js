import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/authUtils.js";


async function registerUserByExtension(req, res) {
    const user = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    try {
        // בדיקה אם המשתמש כבר קיים לפי phone
        const existingUser = await User.findOne({ phone: user.phone });

        if (existingUser) {
            if (existingUser.registeredVia.includes("Extension")) {
                return res.status(400).json({ message: 'Phone number already registered' });
            }
            else {
                // אם המשתמש כבר רשום דרך Dashboard, נוסיף את "Extension" לרשימת registeredVia
                existingUser.registeredVia.push("Extension");
                //existingUser.linkedPhones = [...new Set([...existingUser.linkedPhones, ...user.linkedPhones])]; // הוספת טלפונים מבלי כפילויות
                existingUser.linkedPhones.push(user.linkedPhones);
                existingUser.privacyAccepted = user.privacyAccepted; // עדכון הסכמה לפרטיות
                await existingUser.save();
                return res.status(200).json({ message: 'User added to Extension successfully' });
            }
        }

        // יצירת משתמש חדש
        const newUser = new User({
            name: user.name,
            phone: user.phone,
            password: hashedPassword,
            registeredVia: ["Extension"],
            linkedPhones: user.linkedPhones,
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

async function loginUserByExtension(req, res) {
    const { phone, password } = req.body;
    console.log(phone);

    try {
        // בדיקת משתמש לפי phone
        const user = await User.findOne({ phone });

        if (!user) {
            return res.status(401).json({ message: 'Phone number not found in system' });
        }

        if (user.registeredVia.includes("Extension") === false) {
            return res.status(401).json({ message: 'You have to register via Extension' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // יצירת טוקן
        const token = generateToken(user);

        res.status(200).json({
            message: 'User logged in successfully',
            token,
        });

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Error logging' });
    }
}

async function registerUserByDashboard(req, res) {
    const { name, phone, password, registrationDate } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        // בדיקה אם המשתמש כבר קיים
        const existingUser = await User.findOne({ phone: phone });

        if (existingUser) {
            if (existingUser.registeredVia.includes("Dashboard") || existingUser.registeredVia.includes("Extension")) {
                return res.status(400).json({ message: 'Phone already registered to ' + existingUser.registeredVia.join(", ") });
            }
        }

        // יצירת משתמש חדש
        const newUser = new User({
            name: name,
            phone: phone,
            password: hashedPassword,
            registeredVia: ["Dashboard"], // אם לא נשלח, ישמור כרשימה ריקה
            linkedPhones: [],
            privacyAccepted: false,
            registrationDate: registrationDate
        });

        await newUser.save();
        // יצירת טוקן
        const token = generateToken(newUser);
        res.status(200).json({
            message: 'User registered to dashboard successfully',
            token, // שליחת הטוקן ללקוח
        });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
}

async function loginUserByDashboard(req, res) {
    const { phone, password } = req.body;

    try {
        // בדיקת משתמש וסיסמה
        const user = await User.findOne({ phone: phone });

        if (!user) {
            return res.status(401).json({ message: 'phone not found in system' });
        }

        // if user exist so he must have a least Extension or Dashboard registeredVia
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // יצירת טוקן
        const token = generateToken(user);

        res.status(200).json({
            message: 'User logged in successfully',
            token, // שליחת הטוקן ללקוח
        });


    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Error logging' });
    }
}

/*
async function getUserProfile(req, res) {
    const phone = req.query.phone;
    try {
        // בדיקת משתמש וסיסמה
        const mainUser = await User.findOne({ phone: phone });

        if (!mainUser) {
            return res.status(401).json({ message: 'phone not found in system' });
        }

        // מציאת כל המשתמשים שקישרו את הפאלפון הזה
        const allUsers = await User.find({
            linkedPhones: phone
        });

        // החזרת המידע הרלוונטי על המשתמשים
        const linkedUsers = allUsers.map(user => (user.phone));

        res.status(200).json({
            user: {
                name: mainUser.name,
                phone: mainUser.phone,
                registeredVia: mainUser.registeredVia,
                linkedPhones: linkedUsers
            }
        });


    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
}
*/

async function getUserProfile(req, res) {
    const phone = req.query.phone;
    try {
        const mainUser = await User.findOne({ phone: phone });

        if (!mainUser) {
            return res.status(401).json({ message: 'phone not found in system' });
        }

        const allUsers = await User.find({ linkedPhones: phone });

        const linkedUsers = allUsers.map(user => user.phone);

        const linkedPhonesDetails = await User.find({
            phone: { $in: linkedUsers }
        }).select('phone name');

        res.status(200).json({
            user: {
                name: mainUser.name,
                phone: mainUser.phone,
                registeredVia: mainUser.registeredVia,
                linkedPhones: linkedUsers,
                linkedPhonesDetails
            }
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
}

export { registerUserByExtension, loginUserByExtension, registerUserByDashboard, loginUserByDashboard, getUserProfile };