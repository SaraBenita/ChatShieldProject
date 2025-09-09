document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.remove('token', function () {
        console.log('Token removed successfully!');
    });
    switchTab('login');

    
    document.getElementById('loginTab').addEventListener('click', () => switchTab('login'));
    document.getElementById('registerTab').addEventListener('click', () => switchTab('register'));

    document.getElementById('loginButton').addEventListener('click', handleLogin);
    document.getElementById('registerButton').addEventListener('click', handleRegister);

    const modal = document.getElementById('termsModal');
    const termsLink = document.getElementById('termsLink');
    const closeBtn = document.querySelector('.close');
    const acceptBtn = document.getElementById('acceptTerms');
    const declineBtn = document.getElementById('declineTerms');
    const privacyCheckbox = document.getElementById('privacyConsent');

    termsLink.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    acceptBtn.addEventListener('click', () => {
        privacyCheckbox.checked = true;
        modal.style.display = 'none';
    });

    declineBtn.addEventListener('click', () => {
        privacyCheckbox.checked = false;
        modal.style.display = 'none';
    });

    // הוספת טלפונים מקושרים
    const addPhoneBtn = document.getElementById('addPhoneButton');
    addPhoneBtn.addEventListener('click', function () {
        const container = document.getElementById('linkedPhonesContainer');
        const phoneInputs = Array.from(container.querySelectorAll('.linkedPhone'));
        const lastPhoneInput = phoneInputs[phoneInputs.length - 1];

        if (!isValidPhone(lastPhoneInput.value)) {
            document.getElementById('linkedPhonesError').textContent = 'Please enter a valid phone number before adding another.';
            return;
        }

        document.getElementById('linkedPhonesError').textContent = '';

        const phoneWrapper = document.createElement('div');
        phoneWrapper.className = 'phone-input-wrapper';

        const input = document.createElement('input');
        input.type = 'tel';
        input.className = 'linkedPhone';
        input.placeholder = 'Enter phone to link';

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'remove-phone-button';
        removeButton.textContent = '-';
        removeButton.addEventListener('click', function () {
            container.removeChild(phoneWrapper);
            document.getElementById('linkedPhonesError').textContent = '';
        });

        phoneWrapper.appendChild(input);
        phoneWrapper.appendChild(removeButton);
        container.appendChild(phoneWrapper);
    });

    const checkboxWrapper = document.querySelector('.checkbox-wrapper');
    checkboxWrapper.addEventListener('mouseover', () => {
        if (privacyCheckbox.disabled) {
            document.querySelector('.tooltip').style.display = 'block';
        }
    });

    checkboxWrapper.addEventListener('mouseout', () => {
        document.querySelector('.tooltip').style.display = 'none';
    });
});

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));

    if (tab === 'login') {
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('registerTab').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{9,15}$/;
    return phoneRegex.test(phone);
}

async function handleLogin() {
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;

    document.getElementById('loginPhoneError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';

    if (!phone) {
        document.getElementById('loginPhoneError').textContent = 'Phone number is required';
    }

    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Password is required';
        return;
    }

    sendUserDataToServerLogin(phone, password);
}

async function handleRegister() {
    const name = document.getElementById('registerName').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const privacyConsent = document.getElementById('privacyConsent').checked;

    const linkedPhones = Array.from(document.querySelectorAll('.linkedPhone'))
        .map(input => input.value.trim())
        .filter(phone => phone !== "");

    document.getElementById('registerNameError').textContent = '';
    document.getElementById('registerPhoneError').textContent = '';
    document.getElementById('registerPasswordError').textContent = '';
    document.getElementById('linkedPhonesError').textContent = '';

    if (!name || name.length < 2) {
        document.getElementById('registerNameError').textContent = 'Name must be at least 2 characters';
    }

    if (!phone || !isValidPhone(phone)) {
        document.getElementById('registerPhoneError').textContent = 'Valid phone number is required';
    }

    const invalidPhones = linkedPhones.filter(p => !isValidPhone(p));
    if (invalidPhones.length > 0) {
        document.getElementById('linkedPhonesError').textContent = 'Please enter valid linked phone numbers.';
    }

    if (!password || password.length < 6) {
        document.getElementById('registerPasswordError').textContent = 'Password must be at least 6 characters';
        return;
    }

    if (!privacyConsent) {
        alert('You must accept the privacy terms to continue');
        return;
    }

    const user = {
        name,
        phone,
        password,
        linkedPhones,
        privacyAccepted: true,
        registrationDate: new Date().toISOString()
    };

    sendUserDataToServerRegister(user);
}

async function sendUserDataToServerRegister(user) {
    try {
        const response = await fetch('http://host.docker.internal:5000/user/registerByExtension', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        if (!response.ok) {
            const error = await response.json();
            alert(error.message);
            resetFormFields('registerForm');
            return;
        }

        alert('Registration successful!');
        switchTab('login');
    } catch (error) {
        console.error('Error registering user:', error);
        alert('An error occurred during registration.');
        resetFormFields('registerForm');
    }
}

async function sendUserDataToServerLogin(phone, password) {
    try {
        const response = await fetch('http://host.docker.internal:5000/user/loginByExtension', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
        });

        if (!response.ok) {
            console.log(response);  // <--- תוסיפי את זה

            const error = await response.json();
            alert(error.message);
            resetFormFields('loginForm');
            return;
        }

        const data = await response.json();
        chrome.storage.sync.set({ token: data.token }, function () {
            console.log('Token saved successfully!');
        });

        alert(data.message);
        window.location.href = 'https://web.whatsapp.com/';

    } catch (error) {
        console.error('Error login user:', error);
        alert('An error occurred during login.');
        resetFormFields('loginForm');
    }
}

function resetFormFields(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        const errorMessages = container.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.textContent = '';
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['userLoggedIn', 'userPhone'], function (result) {
        if (result.userLoggedIn) {
            window.close();
        }
    });
});
