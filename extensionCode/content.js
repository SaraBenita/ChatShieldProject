let currentChatName = null;
let timeEnterToChat = null;
let messageObserver = null; // שמירה על ה-Observer כדי שנוכל לעצור אותו


let printTime = (time) => {
    const hours = time.getHours().toString().padStart(2, '0'); 
    const minutes = time.getMinutes().toString().padStart(2, '0'); 
    const seconds = time.getSeconds().toString().padStart(2, '0'); 
    console.log(`⏳ הצ'אט התחלף בזמן: ${hours}:${minutes}:${seconds}`);
}

let monitorNewMessages = () => {

    const currentChatSelector = 'div[aria-selected="true"] span[title]';
    const outgoingMessageSelector = '.message-out';
    const chatContainerSelector = '#main';

    // פונקציה לעדכון הצ'אט הנוכחי
    function updateCurrentChat() {
        const currentChatElement = document.querySelector(currentChatSelector);
        if (currentChatElement) {
            const newChatName = currentChatElement.textContent.trim();
            if (newChatName !== currentChatName) {
                currentChatName = newChatName;
                timeEnterToChat = new Date();
                timeEnterToChat.setSeconds(0, 0); // מאפס את השניות והמילישניות
                console.log(`🔥 עבר לצ'אט: ${currentChatName}`);
                printTime(timeEnterToChat);

                observeChatContainer(); // התחל להאזין להודעות בצ'אט החדש
            }
        }
    }

    // מאזין לשינויי צ'אט
    const chatObserver = new MutationObserver(updateCurrentChat);
    chatObserver.observe(document.body, { childList: true, subtree: true });


    // על מנת לבצע המרה של הטקסט שהתקבל באטריביוט לאובייקט Date()
    function parseMessageTime(dataPrePlainText) {
        const timeMatch = dataPrePlainText.match(/\[(\d{2}):(\d{2}), (\d{1,2})\.(\d{1,2})\.(\d{4})\]/);
        if (!timeMatch) return null;
    
        const [, hours, minutes, day, month, year] = timeMatch.map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    }

    function extractMessageText(ariaLabel) {
        if (!ariaLabel) return null;
    
        // מחלקים את הטקסט לפי `&rlm;`
        const parts = ariaLabel.split('\u200F \u200F'); // '\u200F' זה הקוד של &rlm;
        
        if (parts.length < 3) return null; // אם המבנה לא כרגיל, מחזירים null
        
        return parts[1].trim(); // החלק האמצעי הוא תוכן ההודעה
    }

    function sendNewMessagesToServer(mutations) {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                //console.log("🆕 אלמנט חדש התווסף לצ'אט:", node);
                
                // חיפוש הודעה יוצאת בתוך ה-node
                const messageOutElement = node.querySelector(outgoingMessageSelector);
                if (!messageOutElement) return;
    
                // בדיקה אם ההודעה כבר טופלה
                if (messageOutElement.hasAttribute('data-handled')) return;
    
                //console.log('🔍 נמצאה הודעה יוצאת חדשה', messageOutElement);
    
                // קבלת הטקסט מה-aria-label
                const messageText = extractMessageText(messageOutElement.getAttribute('aria-label')?.trim());
                if (!messageText) return;
                //console.log(messageText);
    
                // מציאת האלמנט עם data-pre-plain-text כדי להוציא זמן ותאריך
                const dataPrePlainTextElement = messageOutElement.querySelector('[data-pre-plain-text]');
                if (!dataPrePlainTextElement) return;
    
                const messageTime = parseMessageTime(dataPrePlainTextElement.getAttribute('data-pre-plain-text'));
                //console.log(messageTime);

                // אם לא הצלחנו להוציא חותמת זמן או שההודעה נשלחה לפני שנכנסנו לצ'אט - לא נטפל בה
                if (!messageTime || messageTime < timeEnterToChat) return;
    
                console.log(`📩 נשלחה הודעה (${messageTime}): ${messageText}`);
    
                chrome.runtime.sendMessage({
                    type: 'messageSent',
                    text: messageText,
                    chatName: currentChatName,
                    timestamp: messageTime.toISOString()
                });
    
                // סימון ההודעה כ"טופלה" כדי שלא נעבד אותה שוב
                messageOutElement.setAttribute('data-handled', 'true');
            });
        });
    }

    function observeChatContainer() {
        const chatContainer = document.querySelector(chatContainerSelector);
        if (!chatContainer) return;
    
        console.log("🔄 נמצא קונטיינר הודעות חדש, מאזין להודעות יוצאות...");
    
        if (messageObserver) {
            messageObserver.disconnect();
        }
    
        messageObserver = new MutationObserver(sendNewMessagesToServer);
        messageObserver.observe(chatContainer, { childList: true, subtree: true });
    }
}

// הפעלת הפונקציה
monitorNewMessages();
   