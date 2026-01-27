// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const themeToggleBtn = document.getElementById('themeToggle');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Support card elements
const supportLink = document.getElementById('supportLink');
const supportCard = document.getElementById('supportCard');
const closeSupportBtn = document.getElementById('closeSupportBtn');
const overlay = document.getElementById('overlay');

// Show/hide password functionality
togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
    
    // Accessibility: update button label
    const action = type === 'text' ? 'Hide' : 'Show';
    this.setAttribute('aria-label', `${action} password`);
});

// Theme toggle functionality
themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
    
    // Update button icon
    const icon = this.querySelector('i');
    if (document.body.classList.contains('light-theme')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        showNotification('Switched to light theme', 'info');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        showNotification('Switched to dark theme', 'info');
    }
});

// Support card functionality
supportLink.addEventListener('click', function(e) {
    e.preventDefault();
    openSupportCard();
});

closeSupportBtn.addEventListener('click', function() {
    closeSupportCard();
});

overlay.addEventListener('click', function() {
    closeSupportCard();
});

// Open support card
function openSupportCard() {
    supportCard.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close support card
function closeSupportCard() {
    supportCard.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Close support card with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && supportCard.classList.contains('active')) {
        closeSupportCard();
    }
});

// Form validation
function validateForm() {
    let isValid = true;
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Clear previous errors
    usernameError.style.display = 'none';
    passwordError.style.display = 'none';
    
    // Username validation
    if (username.length === 0) {
        usernameError.textContent = 'Username is required';
        usernameError.style.display = 'block';
        usernameInput.style.borderColor = '#ff6b6b';
        isValid = false;
    } else if (username.length < 3) {
        usernameError.textContent = 'Username must be at least 3 characters';
        usernameError.style.display = 'block';
        usernameInput.style.borderColor = '#ff6b6b';
        isValid = false;
    } else {
        usernameInput.style.borderColor = '#333';
    }
    
    // Password validation
    if (password.length === 0) {
        passwordError.textContent = 'Password is required';
        passwordError.style.display = 'block';
        passwordInput.style.borderColor = '#ff6b6b';
        isValid = false;
    } else if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        passwordError.style.display = 'block';
        passwordInput.style.borderColor = '#ff6b6b';
        isValid = false;
    } else {
        passwordInput.style.borderColor = '#333';
    }
    
    return isValid;
}

// Show notification
function showNotification(message, type = 'info') {
    notificationMessage.textContent = message;
    
    // Set color based on type
    if (type === 'success') {
        notification.style.borderLeftColor = '#4CAF50';
    } else if (type === 'error') {
        notification.style.borderLeftColor = '#ff6b6b';
    } else {
        notification.style.borderLeftColor = '#4a9eff';
    }
    
    notification.style.display = 'block';
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

// Form submission - WITH REDIRECT TO ADMIN PAGE
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Close support card if open
    if (supportCard.classList.contains('active')) {
        closeSupportCard();
    }
    
    if (!validateForm()) {
        return;
    }
    
    // Simulate login process
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;
    
    // Show loading state
    const submitBtn = loginForm.querySelector('.btn-login');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    submitBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // In a real app, you would make an API call here
        // For demo purposes, we'll simulate a successful login for specific credentials
        if (username === 'admin' && password === 'admin123') {
            showNotification(`Welcome back, ${username}! Redirecting to admin dashboard...`, 'success');
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberedUser', username);
            } else {
                localStorage.removeItem('rememberedUser');
            }
            
            // SET SESSION FLAG FOR ADMIN PAGE ACCESS
            localStorage.setItem('isLoggedIn', 'true');
            
            // REDIRECT TO ADMIN PAGE AFTER 1.5 SECONDS
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
            
        } else {
            showNotification('Invalid username or password. Try "demo" / "password" for demo.', 'error');
        }
    }, 1500);
});

// Check for remembered user
window.addEventListener('load', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        usernameInput.value = rememberedUser;
        rememberMeCheckbox.checked = true;
    }
    
    // Set focus to username field
    usernameInput.focus();
});

// Real-time validation for better UX
usernameInput.addEventListener('input', function() {
    if (usernameError.style.display === 'block') {
        validateForm();
    }
});

passwordInput.addEventListener('input', function() {
    if (passwordError.style.display === 'block') {
        validateForm();
    }
});

// Input focus effects
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.style.borderColor = '#4a9eff';
    });
    
    input.addEventListener('blur', function() {
        if (!this.classList.contains('error')) {
            this.style.borderColor = '#333';
        }
    });
});

// Demo credentials info on page load
window.addEventListener('load', function() {
    setTimeout(() => {
        showNotification('Use "admin" / "admin123" for demo login', 'info');
    }, 1000);
});