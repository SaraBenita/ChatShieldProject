// מוניטור ברקע של הודעות שנשלחו
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['userLoggedIn', 'userEmail'], function(result) {
        if (!result.userLoggedIn) {
            chrome.tabs.create({
                url: 'onboarding/onboarding.html'
            });
        } else {
            console.log(`User already logged in: ${result.userEmail}`);
        }
    });
});



// מאזין להודעות שמגיעות מ-content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'messageSent') {
        console.log('Message send: ', message.text);
        // שליחה של ההודעה לשרת לצורך ניתוח
        fetch("http://localhost:5000/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message)
        })
            .then(response => {
                console.log("Raw response:", response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    if(data.label === "Safe") {
                        return;
                    }
                    chrome.windows.create({
                        url: `popup.html?message=${encodeURIComponent(data.message)}&label=${encodeURIComponent(data.label)}&explanation=${encodeURIComponent(data.explanation)}`,
                        type: 'popup',
                        width: 400,
                        height: 400
                    });
                }
            })
            .catch(error => console.error("eror: ", error));

    }
});


