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

function isUserLoggedIn() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['token'], function (result) {
            console.log('Token retrieved:', result.token);
            resolve(result.token || null); // מחזיר את הטוקן אם קיים, אחרת null
        });
    });
}

// מאזין להודעות שמגיעות מ-content script
chrome.runtime.onMessage.addListener(async (messageInfo, sender, sendResponse) => {
    const token = await isUserLoggedIn(); // מחכה לתוצאה של isUserLoggedIn ומקבל את הטוקן

    if (!token) {
        console.log('User is not logged in. Notifications are disabled.');
        return; // אם המשתמש לא מחובר, לא מבצעים כלום
    }

    if (messageInfo.type === 'messageSent') {
        console.log('Message sent: ', messageInfo.text);

        // שליחה של ההודעה לשרת לצורך ניתוח
        /*
        fetch("http://localhost:5000/messages/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // הוספת הטוקן לכותרת Authorization
            },
            body: JSON.stringify(messageInfo)
        })
            */
           
           fetch("http://host.docker.internal:5000/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // הוספת הטוקן לכותרת Authorization
                },
                body: JSON.stringify(messageInfo)
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
                    if (data.label === "Safe." || data.label === "Safe") {
                        return;
                    }
                    chrome.windows.create({
                        url: `popup.html?message=${encodeURIComponent(data.message)}&label=${encodeURIComponent(data.label)}&explanation=${encodeURIComponent(data.explanation)}&chatName=${encodeURIComponent(data.chatName)}`,
                        type: 'popup',
                        width: 650,
                        height: 550,
                        top: 100,
                        left: 100,
                        focused: true
                    });
                }
            })
            .catch(error => console.error("Error: ", error));
    }
});