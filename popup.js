document.getElementById('enableAlerts').addEventListener('change', (event) => {
    const enabled = event.target.checked;
    chrome.storage.sync.set({ alertsEnabled: enabled }, () => {
        console.log('מצב התראות:', enabled);
    });
});