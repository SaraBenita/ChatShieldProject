import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const OPEN_AI_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPEN_AI_KEY,
});
 
export default openai;