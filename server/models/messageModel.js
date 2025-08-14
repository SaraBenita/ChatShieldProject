import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    phone: { type: String, required: true }, // טלפון של המשתמש
    chatName: { type: String, required: true }, // שם הצ'אט
    timestamp: { type: Date, required: true }, // זמן שליחת ההודעה
    message: { type: String, required: true }, // תוכן ההודעה
    analysis: { // תוצאות הניתוח
        label: { type: String, required: true }, // קטגוריה (לדוגמה: "Sensitive")
        explanation: { type: String, required: true }, // הסבר לקטגוריה
    },
});

const Message = mongoose.model('Message', messageSchema, 'usersMessages'); // שמירת המודל במסד הנתונים בשם "messages"

export default Message;