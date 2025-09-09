import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    chatName: { type: String, required: true },
    timestamp: { type: Date, required: true }, 
    message: { type: String, required: true }, 
    analysis: { 
        label: { type: String, required: true }, 
        explanation: { type: String, required: true }, 
    },
});

const Message = mongoose.model('Message', messageSchema, 'usersMessages'); 

export default Message;