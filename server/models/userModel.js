import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    registeredVia: { type: [String], default: [] },
    linkedPhones: { type: [String], default: [] },
    privacyAccepted: { type: Boolean, required: true },
    registrationDate: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema, 'users');

export default User;