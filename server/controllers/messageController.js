import { spawn } from "child_process";

const sendMessage = async (req, res) => {
    try {
        const message = req.body.text;

        // הפעלת סקריפט Python
        const pythonProcess = spawn("python", [
            "./analyzer/analyze_massage.py",
            message,
        ]);

        let analysisResult = "";

        pythonProcess.stdout.on("data", (data) => {
            analysisResult += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            console.error(`Error: ${data}`);
        });

        pythonProcess.on("close", (code) => {
            if (code === 0) {
                //לבדוק למה?????????????????????????
                const cleanedResult = analysisResult.trim(); // מסיר רווחים ושורות ריקות
                const parsedResult = JSON.parse(cleanedResult); // ניסיון להמיר ל-JSON
                
                // תגובות מותאמות לפי קטגוריה
                let responseMessage = `Your message: ${message} seems safe.`;

                if (parsedResult) {
                    responseMessage = `Warning!\nYour message: ${message}\nmay expose: ${parsedResult.label}.`;
                }
                console.log(responseMessage);

                res.json({
                    success: true,
                    message: responseMessage,
                    details: parsedResult,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
        console.log(error);
    }
};

export { sendMessage };


/*
import analyzeMessage from "../analyzer/analyze_message1.js";

const sendMessage = async (req, res) => {
    try {
        const message = req.body.text;בךקשר
        const analysisResult = await analyzeMessage(message);
        //console.log(analysisResult);

        // תגובות מותאמות לפי קטגוריה
        let responseMessage = `Your message: ${message} seems safe.`;
        
        if (analysisResult){ //&& analysisResult.score > 0.5) {
            responseMessage = `Warning!\nYour message: ${message}\nmay expose: ${analysisResult.label}.`;
        }
        console.log(responseMessage);


        res.json({ success: true, message: responseMessage, details: analysisResult });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
        console.log(error.error);
    }
};

export {
    sendMessage
};
*/
