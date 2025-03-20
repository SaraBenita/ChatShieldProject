// מוניטור ברקע של הודעות שנשלחו
chrome.runtime.onInstalled.addListener(() => {
    console.log('WhatsApp Privacy Monitor Extension Installed');
});

/*

// מאזין להודעות שמגיעות מ-content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'messageSent') {
        console.log('📩 הודעה נשלחה:', message.text);
        // שליחה של ההודעה לשרת לצורך ניתוח
        fetch("http://localhost:8080/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [message.text] })
        })
            .then(response => response.json())
            .then(data => {
                if (data.alert) {
                    alert(`⚠️ אזהרת פרטיות: ${data.alert}`);
                }
            })
            .catch(error => console.error("❌ שגיאה בשליחת הודעות:", error));

        sendResponse({ status: 'message processed' });
    }
});
*/

