document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    const label = params.get('label');
    const explanation = params.get('explanation');

    // עדכון התוכן
    document.getElementById('type').textContent = `Type: ${label}`;
    document.getElementById('message').textContent = message;
    document.getElementById('response-details').textContent = `Explanation: ${explanation}`;
    document.getElementById('details').textContent = 'This message reveals sensitive information.';

    // הגדרת כפתור ה-Ignore
    document.getElementById('ignoreButton').addEventListener('click', function() {
        window.close();
    });
    document.getElementById('logOutButton').addEventListener('click', function() {
       logoutUser();
       window.close();
    });
});

function logoutUser() {
    chrome.storage.sync.remove('token', function () {
        console.log('Token removed successfully!');
        alert('You have been logged out.');
    });
}

