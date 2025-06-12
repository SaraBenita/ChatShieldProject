let currentChatName = null;
let timeEnterToChat = null;
let messageObserver = null; // שמירה על ה-Observer כדי שנוכל לעצור אותו
let lastProcessedMessage = null;
let isFirstLoad = true;
let isScrolling = false;
let scrollEndTimeout = null; 

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

                //processMessage(currentChatName, messageText); לחזור לפה
    
                chrome.runtime.sendMessage({
                    type: 'messageSent', // maybe think if needed
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

function monitorChatList() {
    const chatListSelector = 'div[aria-label="רשימת צ\'אטים"][role="grid"]';
    const topChatSelector = 'div[role="listitem"]:first-child';
    
   

    function isSameMessage(messageA, messageB) 
    {
           if (!messageA || !messageB) return false;
           if(messageA.timestamp > messageB.timestamp) return false;
           console.log("---------------------------------------");
           console.log("🔍 השוואת הודעות:", messageA, messageB);
           console.log("---------------------------------------");
            return (
                messageA.chatName == messageB.chatName &&
                messageA.text == messageB.text &&
                messageA.timestamp == messageB.timestamp
            );            
    }

    function extractTimeFromTopChat(topChat) {
        
        // מחפש את אלמנט הזמן בתוך ה-gridcell
        const gridcells = topChat.querySelectorAll('div[role="gridcell"]');
        if (!gridcells.length) return null;

        // הזמן נמצא ב-div השני בתוך ה-gridcell הראשון
        const timeElement = gridcells[0]?.querySelector('div:nth-child(2)');
        if (!timeElement) return null;

        const timeText = timeElement.textContent.trim();
        console.log("⏰ נמצא זמן:", timeText);
        return timeText;
    }
    

    function checkForNewMessages(mutations) {
        
        if (isScrolling) {
            console.log("⛔ מתבצעת גלילה, מתעלם מהשינויים ב-DOM.");
            return;
        }
         

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof Element)) return;

                console.log("-----------------------------------------------------");
                console.log("🆕 אלמנט חדש התווסף:", node);

                 // בדיקה אם רשימת הצ'אטים נטענה
                const chatListContainer = document.querySelector(chatListSelector);
                if (!chatListContainer) {
                    console.log("❌ רשימת הצ'אטים עדיין לא נטענה.");
                    return;
                }

                chatListContainer.addEventListener('scroll', () => {
                    isScrolling = true;
                    // נניח גלילה נגמרת אחרי 200ms של שקט
                    clearTimeout(scrollEndTimeout);
                        scrollEndTimeout = setTimeout(() => {
                            isScrolling = false;
                        }, 1000)
                });

                console.log("✅ רשימת הצ'אטים נטענה.");  

                
                // בדיקה אם ה-node הוא הצ'אט העליון
                const topChat = chatListContainer.querySelector(topChatSelector);
                if (!topChat || !topChat.contains(node)) {
                    console.log("❌ ה-Node אינו הצ'אט העליון.");
                    return;
                }
            
                console.log("✅ ה-Node הוא הצ'אט העליון.");
                
                // בדיקה אם הצ'אט העליון מכיל אלמנט של "וי אחד"
                const statusCheckElement = topChat.querySelector('span[data-icon="status-check"]');
                const dStatusCheckElement = topChat.querySelector('span[data-icon="status-dblcheck"]');
                
                if (!statusCheckElement && !dStatusCheckElement) 
                {
                        isFirstLoad = false;
                        return;
                }

                const chatName = topChat.querySelector('span[title]')?.textContent.trim();
                const messageElement = topChat.querySelector('span[dir="ltr"]') || topChat.querySelector('span[dir="rtl"]'); // מציאת ההודעה
                const timestamp = extractTimeFromTopChat(topChat); // חילוץ הטייםסטמפ מהצ'אט העליון

                    if (!chatName || !messageElement || !timestamp) return; 
                     console.log("⏰ טייםסטמפ מהצ'אט העליון:", timestamp);
                    
                    const messageText = messageElement.textContent.trim();
                    const currentMessage = {
                        chatName,
                        text: messageText,
                        timestamp 
                    };

                    // השוואה להודעה האחרונה
                    if (isSameMessage(lastProcessedMessage,currentMessage)) {
                        console.log("⚠️ זו אותה הודעה שכבר טופלה. מדלג...");
                        return;
                    }

                    lastProcessedMessage = currentMessage; // עדכון ההודעה האחרונה מעובדת
                    console.log(`📥 הודעה חדשה נשלחה בצ'אט: ${chatName}`);
                    console.log(`💬 תוכן ההודעה: ${messageText}`);

                    if(isFirstLoad)
                    {
                        isFirstLoad = false;
                        return;
                    }

                    processMessage(chatName, messageText);
                    
            });
        });
    }

    const chatListObserver = new MutationObserver(checkForNewMessages);
    chatListObserver.observe(document.body, { childList: true, subtree: true });
}

// פונקציה לעיבוד ההודעה
function processMessage(chatName, messageText) {
    console.log(`📤 שולח הודעה לעיבוד: ${messageText} מצ'אט: ${chatName}`);
    chrome.runtime.sendMessage({
        type: 'messageSent',
        text: messageText,
        chatName: chatName,
        timestamp: new Date().toISOString()
    });
}
// הפעלת המעקב אחרי הצ'אט הפעיל
monitorNewMessages();

// הפעלת המעקב אחרי רשימת הצ'אטים
monitorChatList();




