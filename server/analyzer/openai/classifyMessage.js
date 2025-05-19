import openai from "./openaiClient.js";
 
const ASSISTANT_ID = "asst_kEiKIjCSfqsJNDUyAPVsYD19"; // שימי כאן את האמיתי
 
async function classifyMessage(message) {

  // Step 1: Create a new thread
  const thread = await openai.beta.threads.create();
  const threadId = thread.id;
 
  // Step 2: Send the message
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message
  });
 
  // Step 3: Run the assistant
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID
  });
 
  // Step 4: Wait for completion
  let status;
  do {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    status = runStatus.status;
    await new Promise((resolve) => setTimeout(resolve, 1000));
} while (status !== "completed");
 
  // Step 5: Get result
  const messages = await openai.beta.threads.messages.list(threadId);
  const lastMessage = messages.data[0].content[0].text.value;

  return lastMessage;

}

export default classifyMessage;
 