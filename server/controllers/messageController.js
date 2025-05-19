//import { spawn } from "child_process";
import classifyMessage from "../analyzer/openai/classifyMessage.js";

const sendMessage = async (req, res) => {
    try {
        const message = req.body.text;
        const analysisResult = await classifyMessage(message);
        // תגובות מותאמות לפי קטגוריה
        const responseMessage = `Warning!\nYour message: ${message}`;

        // פיצול הטקסט לשני חלקים לפי הנקודה הראשונה
        const [label, ...rest] = analysisResult.split(/\.(.+)/); // מחלק לפי הנקודה הראשונה בלבד
        const explanation = rest.join('.').trim(); // מחבר את שאר הטקסט (אם יש עוד נקודות)

        res.json({ success: true, message: responseMessage, label: label, explanation: explanation }); 
    }
    
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
        console.log(error.error);
    }
};

export {
    sendMessage
};


