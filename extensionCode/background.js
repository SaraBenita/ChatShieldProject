// מוניטור ברקע של הודעות שנשלחו
chrome.runtime.onInstalled.addListener(() => {
    console.log('WhatsApp Privacy Monitor Extension Installed');
});



// מאזין להודעות שמגיעות מ-content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'messageSent') {
        console.log('Message send: ', message.text);
        // שליחה של ההודעה לשרת לצורך ניתוח
        fetch("http://localhost:5000/api/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [message.text] })
        })
            .then(response => response.json())
            .then(data => {
                if (data.alert) {
                    alert(`alert:  ${data.alert}`);
                }
            })
            .catch(error => console.error("eror: ", error));

        sendResponse({ status: 'message processed' });
    }
});


