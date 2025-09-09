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
            resolve(result.token || null); 
        });
    });
}

chrome.runtime.onMessage.addListener(async (messageInfo, sender, sendResponse) => {
    const token = await isUserLoggedIn(); 

    if (!token) {
        console.log('User is not logged in. Notifications are disabled.');
        return; 
    }

    if (messageInfo.type === 'messageSent') {
        console.log('Message sent: ', messageInfo.text);

           fetch("http://host.docker.internal:5000/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
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
            .catch(error => console.error("Error: ", error));
    }
});

