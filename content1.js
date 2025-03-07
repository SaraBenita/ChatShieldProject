console.log("📌 WhatsApp Privacy Monitor Loaded");

// פונקציה לשליפת ההודעות שנשלחו מהצד שלי
function getSentMessages() {
    const sentMessages = [];

    // בודק את כל ההודעות שנשלחו מהצד שלי (הודעות שיש להן את הקלאס message-out)
    const messages = document.querySelectorAll("div.message-out");

    messages.forEach((msg) => {
        const textElement = msg.querySelector("span.selectable-text");
        if (textElement) {
            // אם מצאנו הודעה, אנחנו אוספים אותה
            sentMessages.push(textElement.innerText);
        }
    });

    return sentMessages;
}

// פונקציה לשליחת ההודעות לשרת לניתוח
function analyzeSentMessages(messages) {
    if (messages.length > 0) {
        console.log("🚀 הודעות שנשלחו:", messages);

        fetch("http://localhost:8080/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: messages })
        })
            .then(response => response.json())
            .then(data => {
                if (data.alert) {
                    alert(`⚠️ אזהרת פרטיות: ${data.alert}`);
                }
            })
            .catch(error => console.error("❌ שגיאה בשליחת הודעות:", error));
    }
}

// פונקציה ראשית לניטור הודעות שנשלחו
function monitorSentMessages() {
    // אוספים את ההודעות שנשלחו כל 5 שניות
    setInterval(() => {
        const sentMessages = getSentMessages();

        // אם יש הודעות שנשלחו, אנחנו שולחים אותן לניתוח
        if (sentMessages.length > 0) {
            // שליחה ל-background script
            chrome.runtime.sendMessage({
                type: 'messageSent',
                text: sentMessages.join('\n')
            });

            analyzeSentMessages(sentMessages);
        }

    }, 5000); // בדיקה כל 5 שניות
}

// מפעיל את המעקב כשהתוסף נטען
monitorSentMessages();
