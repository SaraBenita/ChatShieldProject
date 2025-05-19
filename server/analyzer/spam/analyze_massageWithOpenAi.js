import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const API_KEY = process.env.OPENAI_API_KEY;

// הגדרת OpenAI SDK
const openai = new OpenAI({
    apiKey: API_KEY,
});


const basePrompt = `
You are an AI that classifies messages sent via WhatsApp Web. Your goal is to determine if a message exposes sensitive or problematic information that could harm the user. 

First, determine if the message exposes sensitive or problematic information. If the message does not expose any problematic information, respond with "Safe". 

If the message does expose problematic information, classify it into one of the following categories:
- Personal Information: Includes sensitive personal details such as IDs, passwords, login details, or authentication codes.
- Location/Activity: Includes current location, routines, home status, future locations, addresses, travel plans, or daily habits that could expose the user to risks.
- Financial Information: Includes credit card details, bank account numbers, payment information, or any financial data.
- Social Media Activity: Includes sharing information on social media (e.g., usernames, posts, tags, or personal details) that could harm the user.

Here are some examples:
- "My name is John Doe, and my ID number is 123456789." -> Personal Information
- "My password is 12345678." -> Personal Information
- "The OTP for my account is 987654." -> Personal Information
- "I’m currently at Central Park." -> Location/Activity
- "I walk my dog every day at 7 AM near Elm Street." -> Location/Activity
- "I’ll be in Paris next week for vacation." -> Location/Activity
- "My bank account number is 9876543210." -> Financial Information
- "I owe $5,000 on my credit card." -> Financial Information
- "I just posted my vacation dates on Facebook." -> Social Media Activity
- "I just posted my flight details on Twitter. Can’t wait to visit Paris!" -> Social Media Activity
- "I’m live-streaming from my house right now on Instagram."" -> Social Media Activity
- "My full legal name is Johnathan Michael Doe Jr." -> Safe
- "The weather is amazing today." -> Safe
- "I had a great time at the party yesterday." -> Safe

Classify the following WhatsApp message:
`;

async function analyzeMessageWithContext(message) {

    const prompt = `${basePrompt}- "${message}" ->`;

    try {
        // שליחת הבקשה ל-OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // או "gpt-4" אם זמין
            messages: [
                { role: "user", content: prompt },
            ],
            max_tokens: 50,
            temperature: 0.7,
        });

        // קבלת התוצאה
        const classification = completion.choices[0].message.content.trim();
        return classification;
    } catch (error) {
        console.error("Error analyzing message:", error);
        return null;
    }
}

// דוגמה לשימוש
(async () => {
    const message = "I just posted my address on Facebook for my birthday party invitations";
    const result = await analyzeMessageWithContext(message);
    console.log("Classification:", result);
})();