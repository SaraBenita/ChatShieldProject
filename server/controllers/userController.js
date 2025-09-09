import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/authUtils.js";


async function registerUserByExtension(req, res) {
    const user = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    try {
        const existingUser = await User.findOne({ phone: user.phone });

        if (existingUser) {
            if (existingUser.registeredVia.includes("Extension")) {
                return res.status(400).json({ message: 'Phone number already registered' });
            }
            else {
                existingUser.registeredVia.push("Extension");
                existingUser.linkedPhones.push(user.linkedPhones);
                existingUser.privacyAccepted = user.privacyAccepted; 
                await existingUser.save();
                return res.status(200).json({ message: 'User added to Extension successfully' });
            }
        }

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
    const { name, phone, password, registrationDate, linkedPhones } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const existingUser = await User.findOne({ phone: phone });

        if (existingUser) {
            if (existingUser.registeredVia.includes("Dashboard") || existingUser.registeredVia.includes("Extension")) {
                return res.status(400).json({ message: 'Phone already registered to ' + existingUser.registeredVia.join(", ") });
            }
        }

        const linkedPhonesArr = Array.isArray(linkedPhones) ? linkedPhones : (linkedPhones ? [linkedPhones] : []);


        const newUser = new User({
            name: name,
            phone: phone,
            password: hashedPassword,
            registeredVia: ["Dashboard"], 
            linkedPhones: linkedPhonesArr,
            privacyAccepted: false,
            registrationDate: registrationDate
        });

        await newUser.save();
        const token = generateToken(newUser);
        res.status(200).json({
            message: 'User registered to dashboard successfully',
            token, 
        });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
}

async function loginUserByDashboard(req, res) {
    const { phone, password } = req.body;

    try {
        const user = await User.findOne({ phone: phone });

        if (!user) {
            return res.status(401).json({ message: 'phone not found in system' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

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