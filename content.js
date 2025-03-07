let currentChatName = null;
let allMessages = []; // מערך לשמירת 5 ההודעות האחרונות

function monitorNewMessages() {
    const currentChatSelector = 'div[aria-selected="true"] span[title]';
    const outgoingMessageSelector = '.message-out .selectable-text span';

    // פונקציה לעדכון הצ'אט הנוכחי
    function updateCurrentChat() {
        const currentChatElement = document.querySelector(currentChatSelector);
        if (currentChatElement) {
            const newChatName = currentChatElement.textContent;
            if (newChatName !== currentChatName) {
                currentChatName = newChatName;
                console.log(`עבר לצ'אט: ${currentChatName}`);
                allMessages = []; // ניקוי ההודעות כאשר הצ'אט מתחלף
            }
        }
    }

    // מאזין לשינויי צ'אט
    const chatObserver = new MutationObserver(updateCurrentChat);
    chatObserver.observe(document.body, { childList: true, subtree: true });

    // פונקציה לקבלת ההודעות האחרונות
    function displayLastMessages() {
        const outgoingMessages = document.querySelectorAll(outgoingMessageSelector);
        const lastMessages = Array.from(outgoingMessages).slice(-5); // לבדוק את זה שזה לא טוב 

        // בדיקה אם נוספו הודעות חדשות
        lastMessages.forEach((messageElement) => {
            const messageText = messageElement.textContent.trim();
            if (!messageElement.getAttribute('data-processed') && messageText) {
                console.log("הודעה שנשלחה:", messageText);
                if (currentChatName) {
                    chrome.runtime.sendMessage({
                        type: 'analyzeMessage',
                        message: messageText,
                        chatName: currentChatName
                    });
                }
                messageElement.setAttribute('data-processed', 'true'); // סימון כמעובד
            }
        });

        // עדכון מערך ההודעות
        allMessages = [...lastMessages].slice(0, 5);
        console.clear();
        allMessages.forEach((message, index) => {
            console.log(`הודעה ${index + 1}: ${message.textContent}`);
        });
    }

    // הרצת displayLastMessages כל שנייה לזיהוי הודעות חדשות
    setInterval(displayLastMessages, 1000);
}

// הפעלת הפונקציה
monitorNewMessages();

/*
let currentChatName = null;

function monitorNewMessages() {
    const currentChatSelector = 'div[aria-selected="true"] span[title]';
    const messagesContainerSelector = '#main';
    const outgoingMessageSelector = '.message-out .selectable-text span';
   // const messageTextSelector = '._ao3e.selectable-text.copyable-text span';
    
    // פונקציה לעדכון הצ'אט הנוכחי
    function updateCurrentChat() {
        const currentChatElement = document.querySelector(currentChatSelector);
        if (currentChatElement) {
            const newChatName = currentChatElement.textContent;
            // אם שם הצ'אט השתנה
            if (newChatName !== currentChatName) {
                currentChatName = newChatName;
                console.log(`עבר לצ'אט: ${currentChatName}`);
            }
        }
    }
    const chatObserver = new MutationObserver(updateCurrentChat);
    chatObserver.observe(document.body, {
        childList: true,
        subtree: true
    });



    const messagesObserver = new MutationObserver(() => {
        const newOutgoingMessages = document.querySelectorAll(`${outgoingMessageSelector}:not([data-processed])`);
        newOutgoingMessages.forEach((messageElement) => {
            const messageText = messageElement.textContent.trim();
            if (messageText) {
                console.log("הודעה שנשלחה:", messageText);
                if (currentChatName) {
                    chrome.runtime.sendMessage({
                        type: 'analyzeMessage',
                        message: messageText,
                        chatName: currentChatName
                    });
                }
                messageElement.setAttribute('data-processed', 'true');
            }
        });
    });
   

    // מציאת קונטיינר ההודעות
    const currentChatMessagesContainer = document.querySelector(messagesContainerSelector);
    if (currentChatMessagesContainer) {
        messagesObserver.observe(currentChatMessagesContainer, {
            childList: true,
            subtree: true
        });
    }
}

// הפעלת הפונקציה
monitorNewMessages();
*/