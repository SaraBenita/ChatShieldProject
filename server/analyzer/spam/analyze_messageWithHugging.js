import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const API_KEY = process.env.HF_API_KEY;

async function analyzeMessage(message) {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
            {
              inputs: message,
              parameters: {
                candidate_labels: ["Identification","Credentials", "Location", "Routine Activity", "Financial Information", "Social Media Accounts", "Safe"],
              }
            },
            {
              headers: { Authorization: `Bearer ${API_KEY}` }
            }
          );

        // הקטגוריות שלנו
        const categories = ["Identification","Credentials", "Location", "Routine Activity", "Financial Information", "Social Media Accounts", "Safe"];
        const labels = response.data.labels;
        const scores = response.data.scores;

        // חיפוש הקטגוריה עם הציון הגבוה ביותר
        let bestCategory = null;
        let maxScore = 0;

        labels.forEach((label, index) => {
            if (categories.includes(label) && scores[index] > maxScore) {
                bestCategory = { label, score: scores[index] };
                maxScore = scores[index];
            }
        });

        // אם לא נמצאה קטגוריה מתאימה, נחזיר את התווית עם הציון הגבוה ביותר (גם אם היא לא ברשימה)
        if (!bestCategory) {
            bestCategory = { label: labels[0], score: scores[0] };
        }

        return bestCategory; // מחזיר את התוצאה הכי גבוהה בלבד

    } catch (error) {
        console.error("Error analyzing message:", error);
        return null;
    }
}

export default analyzeMessage;
