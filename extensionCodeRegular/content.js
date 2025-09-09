let currentChatName = null;
let timeEnterToChat = null;
let messageObserver = null;
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

    function updateCurrentChat() {
        const currentChatElement = document.querySelector(currentChatSelector);
        if (currentChatElement) {
            const newChatName = currentChatElement.textContent.trim();
            if (newChatName !== currentChatName) {
                currentChatName = newChatName;
                timeEnterToChat = new Date();
                timeEnterToChat.setSeconds(0, 0);
                console.log(`🔥 עבר לצ'אט: ${currentChatName}`);
                printTime(timeEnterToChat);

                observeChatContainer(); 
            }
        }
    }

    const chatObserver = new MutationObserver(updateCurrentChat);
    chatObserver.observe(document.body, { childList: true, subtree: true });


    function parseMessageTime(dataPrePlainText) {
        const timeMatch = dataPrePlainText.match(/\[(\d{2}):(\d{2}), (\d{1,2})\.(\d{1,2})\.(\d{4})\]/);
        if (!timeMatch) return null;
    
        const [, hours, minutes, day, month, year] = timeMatch.map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    }

    function extractMessageText(ariaLabel) {
        if (!ariaLabel) return null;
    
        const parts = ariaLabel.split('\u200F \u200F'); 
        
        if (parts.length < 3) return null; 
        
        return parts[1].trim(); 
    }

    function sendNewMessagesToServer(mutations) {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                
                const messageOutElement = node.querySelector(outgoingMessageSelector);
                if (!messageOutElement) return;
    
                if (messageOutElement.hasAttribute('data-handled')) return;
    
    
                const messageText = extractMessageText(messageOutElement.getAttribute('aria-label')?.trim());
                if (!messageText) return;
    
                const dataPrePlainTextElement = messageOutElement.querySelector('[data-pre-plain-text]');
                if (!dataPrePlainTextElement) return;
    
                const messageTime = parseMessageTime(dataPrePlainTextElement.getAttribute('data-pre-plain-text'));

                if (!messageTime || messageTime < timeEnterToChat) return;
    
                console.log(`📩 נשלחה הודעה (${messageTime}): ${messageText}`);

    
                chrome.runtime.sendMessage({
                    type: 'messageSent', 
                    text: messageText,
                    chatName: currentChatName,
                    timestamp: messageTime.toISOString()
                });
    
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

    function isSameMessage(messageA, messageB) {
        if (!messageA || !messageB) return false;
        if (messageA.timestamp > messageB.timestamp) return false;
        return (
            messageA.chatName === messageB.chatName &&
            messageA.text === messageB.text &&
            messageA.timestamp === messageB.timestamp
        );
    }

    function extractTimeFromTopChat(topChat) {
        const gridcells = topChat.querySelectorAll('div[role="gridcell"]');
        if (!gridcells.length) return null;
        const timeElement = gridcells[0]?.querySelector('div:nth-child(2)');
        if (!timeElement) return null;
        return timeElement.textContent.trim();
    }

    function checkForNewMessages(mutations) {
        if (isScrolling) return;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof Element)) return;

                const chatListContainer = document.querySelector(chatListSelector);
                if (!chatListContainer) return;

                chatListContainer.addEventListener('scroll', () => {
                    isScrolling = true;
                    clearTimeout(scrollEndTimeout);
                    scrollEndTimeout = setTimeout(() => {
                        isScrolling = false;
                    }, 1000);
                });

                const topChat = chatListContainer.querySelector(topChatSelector);
                if (!topChat || !topChat.contains(node)) return;

                const statusCheckElement = topChat.querySelector('span[data-icon="status-check"]');
                const dStatusCheckElement = topChat.querySelector('span[data-icon="status-dblcheck"]');
                if (!statusCheckElement && !dStatusCheckElement) {
                    isFirstLoad = false;
                    return;
                }

                const chatName = topChat.querySelector('span[title]')?.textContent.trim();
                const messageElement = topChat.querySelector('span[dir="ltr"]') || topChat.querySelector('span[dir="rtl"]');
                const timestamp = extractTimeFromTopChat(topChat);
                if (!chatName || !messageElement || !timestamp) return;

                const messageText = messageElement.textContent.trim();
                const currentMessage = {
                    chatName,
                    text: messageText,
                    timestamp
                };

                if (isSameMessage(lastProcessedMessage, currentMessage)) return;

                lastProcessedMessage = currentMessage;

                if (isFirstLoad) {
                    isFirstLoad = false;
                    return;
                }

                processMessage(chatName, messageText);
            });
        });
    }

    function tryStartObserver() {
        const chatListContainer = document.querySelector(chatListSelector);
        if (!chatListContainer) {
            console.log("⌛ מחכה שרשימת הצ'אטים תיטען...");
            setTimeout(tryStartObserver, 500); 
            return;
        }

        const chatListObserver = new MutationObserver(checkForNewMessages);
        chatListObserver.observe(chatListContainer, { childList: true, subtree: true });

        console.log("✅ התחיל מעקב אחרי רשימת הצ'אטים.");
    }

    tryStartObserver(); 
}


function processMessage(chatName, messageText) {
    console.log(`📤 שולח הודעה לעיבוד: ${messageText} מצ'אט: ${chatName}`);
    chrome.runtime.sendMessage({
        type: 'messageSent',
        text: messageText,
        chatName: chatName,
        timestamp: new Date().toISOString()
    });
}
monitorNewMessages();

monitorChatList();




