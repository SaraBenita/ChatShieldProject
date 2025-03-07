let currentChatName = null;

function monitorNewMessages() {
    const currentChatSelector = '.x78zum5 .x1iyjqo2';
    const messagesContainerSelector = '[role="row"]';
    const outgoingMessageSelector = '.message-out';
    const messageTextSelector = '._ao3e.selectable-text.copyable-text span';
    
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

    const messagesObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const newOutgoingMessages = mutation.target.querySelectorAll(`${outgoingMessageSelector}:not([data-processed])`);
                newOutgoingMessages.forEach((messageElement) => {
                    const messageTextElement = messageElement.querySelector(messageTextSelector);
                    if (messageTextElement && messageTextElement.textContent) {
                        const messageText = messageTextElement.textContent.trim();
                        console.log("הודעה שנשלחה:", messageText);
                        // שליחה רק אם זה בצ'אט הנוכחי
                        chrome.runtime.sendMessage({
                            type: 'analyzeMessage',
                            message: messageText,
                            chatName: currentChatName
                        });
                        // סימון כמעובד
                        messageElement.setAttribute('data-processed', 'true');
                    }
                });
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