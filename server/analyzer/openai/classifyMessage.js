import openai from "./openaiClient.js";
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

Classify the following WhatsApp message put a dot after and Add a sentence that explain why exactly its dangorous:
`;


async function classifyMessage(message) {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // or "gpt-3.5-turbo"
    messages: [
      { role: "system", content: basePrompt },
      { role: "user", content: message }
    ]
  });
  return chatCompletion.choices[0].message.content;
}

export default classifyMessage;













// import openai from "./openaiClient.js";
 
// const ASSISTANT_ID = "asst_kEiKIjCSfqsJNDUyAPVsYD19";
 
// async function classifyMessage(message) {

//   // Step 1: Create a new thread
//   const thread = await openai.beta.threads.create();
//   const threadId = thread.id;
 
//   // Step 2: Send the message
//   await openai.beta.threads.messages.create(threadId, {
//     role: "user",
//     content: message
//   });
 
//   // Step 3: Run the assistant
//   const run = await openai.beta.threads.runs.create(threadId, {
//     assistant_id: ASSISTANT_ID
//   });
 
//   // Step 4: Wait for completion
//   let status;
//   do {
//     const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
//     status = runStatus.status;
//     //await new Promise((resolve) => setTimeout(resolve, 1000));
// } while (status !== "completed");
 
//   // Step 5: Get result
//   const messages = await openai.beta.threads.messages.list(threadId);
//   const lastMessage = messages.data[0].content[0].text.value;

//   return lastMessage;

// }

// export default classifyMessage;
 