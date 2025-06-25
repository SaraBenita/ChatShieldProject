//import { spawn } from "child_process";
import classifyMessage from "../analyzer/openai/classifyMessage.js";
import Message from "../models/messageModel.js"; // מודל ההודעות

const sendMessage = async (req, res) => {
    try {

        const message = req.body.text;
        const userEmail = req.user.email; // שימוש במידע מהטוקן
        const chatName = req.body.chatName;
        const timeStemp = req.body.timestamp;


        const analysisResult = await classifyMessage(message);

        // תגובות מותאמות לפי קטגוריה
        const responseMessage = `Warning!\nYour message: ${message}`;

        // פיצול הטקסט לשני חלקים לפי הנקודה הראשונה
        const [label, ...rest] = analysisResult.split(/\.(.+)/); // מחלק לפי הנקודה הראשונה בלבד
        const explanation = rest.join('.').trim(); // מחבר את שאר הטקסט (אם יש עוד נקודות)
        if(label !== "Safe." && label !== "Safe")
        {
            // שמירת ההודעה במסד הנתונים
            const newMessage = new Message({
                email: userEmail,
                chatName: chatName,
                timestamp: timeStemp,
                message: message,
                analysis: {
                    label: label,
                    explanation: explanation,
                },
            });


            await newMessage.save(); // שמירת המסמך ב-MongoDB
        }
       
        res.json({ success: true, message: responseMessage, label: label, explanation: explanation, chatName:chatName }); 
    }
    
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
        console.log(error.error);
    }
};

const getMessagesByUser = async (req, res) => {
    try {
        const userEmail = req.query.email; // שימוש במידע מהטוקן

        // שליפת כל ההודעות של המשתמש
        const messages = await Message.find({ email: userEmail }).sort({ timestamp: -1 }); // מיון לפי זמן (מהחדש לישן)

        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
        console.error(error);
    }
};

export {
    sendMessage,getMessagesByUser
};


