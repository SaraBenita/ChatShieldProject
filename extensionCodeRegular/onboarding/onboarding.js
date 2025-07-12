document.addEventListener('DOMContentLoaded', function() {
     // מחיקת הטוקן מ-localStorage
    chrome.storage.sync.remove('token', function () {
        console.log('Token removed successfully!');
    });
    // הפניה לעמוד התחברות
   switchTab('login');


    // מאזינים לטאבים
    document.getElementById('loginTab').addEventListener('click', () => switchTab('login'));
    document.getElementById('registerTab').addEventListener('click', () => switchTab('register'));

    // מאזינים לכפתורים
    document.getElementById('loginButton').addEventListener('click', handleLogin);
    document.getElementById('registerButton').addEventListener('click', handleRegister);

    // הוספת מאזינים חדשים למודל התנאים
    const modal = document.getElementById('termsModal');
    const termsLink = document.getElementById('termsLink');
    const closeBtn = document.querySelector('.close');
    const acceptBtn = document.getElementById('acceptTerms');
    const declineBtn = document.getElementById('declineTerms');
    const privacyCheckbox = document.getElementById('privacyConsent');
    const emailsLinkedBtn = document.getElementById('addEmailButton');

    // פתיחת המודל בלחיצה על הקישור
    termsLink.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // סגירת המודל בלחיצה על X
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // טיפול באישור התנאים
    acceptBtn.addEventListener('click', () => {
        privacyCheckbox.checked = true;
        modal.style.display = 'none';

    });

    // טיפול בדחיית התנאים
    declineBtn.addEventListener('click', () => {
        privacyCheckbox.checked = false;
        modal.style.display = 'none';
    });

    emailsLinkedBtn.addEventListener('click', function () {
            const container = document.getElementById('linkedEmailsContainer');
            const emailInputs = Array.from(container.querySelectorAll('.linkedEmail'));
            const lastEmailInput = emailInputs[emailInputs.length - 1];

            // בדיקת תקינות המייל האחרון
            if (!isValidEmail(lastEmailInput.value)) {
                document.getElementById('linkedEmailsError').textContent = 'Please enter a valid email before adding another.';
                return;
            }

            // איפוס הודעת השגיאה
            document.getElementById('linkedEmailsError').textContent = '';

            // יצירת שדה מייל חדש
            const emailWrapper = document.createElement('div');
            emailWrapper.className = 'email-input-wrapper';

            const input = document.createElement('input');
            input.type = 'email';
            input.className = 'linkedEmail';
            input.placeholder = 'Enter email to link';

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'remove-email-button';
            removeButton.textContent = '-';
            removeButton.addEventListener('click', function () {
                container.removeChild(emailWrapper);
                  // איפוס הודעת השגיאה
                document.getElementById('linkedEmailsError').textContent = '';
            });

            emailWrapper.appendChild(input);
            emailWrapper.appendChild(removeButton);
            container.appendChild(emailWrapper);
        });
    });

    // מאזין למעבר עכבר מעל הצ'קבוקס המושבת
    const checkboxWrapper = document.querySelector('.checkbox-wrapper');
    checkboxWrapper.addEventListener('mouseover', () => {
        if (privacyCheckbox.disabled) {
            document.querySelector('.tooltip').style.display = 'block';
        }
    });

    checkboxWrapper.addEventListener('mouseout', () => {
        document.querySelector('.tooltip').style.display = 'none';
    });



    // הוספת ולידציה לשדות הקלט
    // ['registerName', 'registerEmail', 'registerPassword'].forEach(id => {
    //     document.getElementById(id).addEventListener('input', validateForm);
    // });


function switchTab(tab) {
    // הסרת active מכל הטאבים והטפסים
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));
    
    // הוספת active לטאב ולטופס הנבחרים לפי ID
    if (tab === 'login') {
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('registerTab').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}


async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Clear previous errors
    document.getElementById('loginEmailError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';

    // Validate inputs
    if (!email) {
        document.getElementById('loginEmailError').textContent = 'Email is required';
    }

    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Password is required';
        return;
    }

    sendUserDataToServerLogin(email, password)
           
}

function isValidEmail(email) {
    // ביטוי רגולרי לבדיקה אם האימייל תקין
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const privacyConsent = document.getElementById('privacyConsent').checked;

    // איסוף כל המיילים המקושרים
    const linkedEmails = Array.from(document.querySelectorAll('.linkedEmail'))
        .map(input => input.value.trim())
        .filter(email => email !== ""); // מסנן שדות ריקים

    // איפוס הודעות שגיאה
    document.getElementById('registerNameError').textContent = '';
    document.getElementById('registerEmailError').textContent = '';
    document.getElementById('registerPasswordError').textContent = '';
    document.getElementById('linkedEmailsError').textContent = '';

    // בדיקת תקינות של השדות
    if (!name || name.length < 2) {
        document.getElementById('registerNameError').textContent = 'Name must be at least 2 characters';
    }

    if (!email || !isValidEmail(email)) {
        document.getElementById('registerEmailError').textContent = 'Valid email is required';
    }

     // בדיקת תקינות של כל המיילים המקושרים (אם יש)
    const invalidEmails = linkedEmails.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
        document.getElementById('linkedEmailsError').textContent = 'Please enter valid email addresses.';
    }

    if (!password || password.length < 6) {
        document.getElementById('registerPasswordError').textContent = 'Password must be at least 6 characters';
        return;
    }

  

    if (!privacyConsent) {
        alert('You must accept the privacy terms to continue');
        return;
    }

    // יצירת משתמש חדש
    const user = {
        name,
        email,
        password,
        linkedEmails, // שמירת המיילים המקושרים (יכול להיות ריק)
        privacyAccepted: true,
        registrationDate: new Date().toISOString()
    };

    // שליחה לשרת
    sendUserDataToServerRegister(user);

}

async function sendUserDataToServerRegister(user) {
    try {
        
        const response = await fetch('http://localhost:5000/user/registerByExtension', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        
        if (!response.ok) {
            const error = await response.json();
            alert(error.message);
            resetFormFields('registerForm'); // איפוס הטופס
            return;
        }

        alert('Registration successful!');
        switchTab('login'); // מעבר לטאב ה-Login

    } catch (error) {
        console.error('Error registering user:', error);
        alert('An error occurred during registration.');
        resetFormFields('registerForm'); // איפוס הטופס

    }
}


async function sendUserDataToServerLogin(email, password) {
    try {
        
        const response = await fetch('http://localhost:5000/user/loginByExtension', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email,password}),
        });


        if (!response.ok) {
            const error = await response.json();
            alert(error.message);
            resetFormFields('loginForm'); // איפוס הטופס
            return;
        }

        const data = await response.json();
        chrome.storage.sync.set({ token: data.token }, function () {
            console.log('Token saved successfully!');
        });

        alert(data.message); // 
        window.location.href = 'https://web.whatsapp.com/';

    } catch (error) {
        console.error('Error login user:', error);
        alert('An error occurred during login.');
        resetFormFields('loginForm'); // איפוס הטופס

    }
}

function resetFormFields(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        // איפוס כל שדות הקלט בתוך ה-container
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false; // איפוס צ'קבוקסים
            } else {
                input.value = ''; // איפוס שדות טקסט, אימייל וסיסמה
            }
        });

        // איפוס הודעות שגיאה
        const errorMessages = container.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.textContent = '';
        });
    }
}

// Check if user is already logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['userLoggedIn', 'userEmail'], function(result) {
        if (result.userLoggedIn) {
            window.close();
        }
    });
});


// כאשר נצטרך לקבל את כל הנתונים של המשתמש וזה עושה הגנה על הנתיב
// דוגמה לשליחת בקשה לנתונים מוגנים
async function fetchProtectedData() {
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:5000/user/protected', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // שליחת הטוקן בכותרת Authorization
        },
    });

    if (!response.ok) {
        console.error('Error fetching protected data:', await response.json());
        return;
    }

    const data = await response.json();
    console.log('Protected data:', data);
}