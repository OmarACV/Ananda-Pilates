// Simple user database (localStorage)
class UserDatabase {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('ananda_users') || '[]');
    }

    save() {
        localStorage.setItem('ananda_users', JSON.stringify(this.users));
    }

    register(userData) {
        // Check if email already exists
        if (this.users.find(user => user.email === userData.email)) {
            throw new Error('Este correo ya está registrado');
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            isActive: true
        };

        this.users.push(newUser);
        this.save();
        return newUser;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Credenciales incorrectas');
        }
        if (!user.isActive) {
            throw new Error('Cuenta desactivada');
        }
        return user;
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('ananda_current_user') || 'null');
    }

    setCurrentUser(user) {
        localStorage.setItem('ananda_current_user', JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem('ananda_current_user');
    }
}

// Initialize database
const db = new UserDatabase();

// DOM Elements
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const successSection = document.getElementById('success-section');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Section switching
function showSection(section) {
    document.querySelectorAll('.auth-section').forEach(s => s.classList.remove('active'));
    section.classList.add('active');
}

showRegisterBtn.addEventListener('click', () => showSection(registerSection));
showLoginBtn.addEventListener('click', () => showSection(loginSection));

// Password toggle functionality
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
        } else {
            input.type = 'password';
            btn.textContent = '👁️';
        }
    });
});

// Show message function
function showMessage(elementId, message, type = 'error') {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// Login form handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = document.getElementById('remember-me').checked;

    try {
        const user = db.login(email, password);
        db.setCurrentUser(user);
        
        if (rememberMe) {
            localStorage.setItem('ananda_remember', 'true');
        }
        
        showMessage('login-message', '¡Bienvenido de vuelta!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        showMessage('login-message', error.message, 'error');
    }
});

// Register form handler
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('register-message', 'Las contraseñas no coinciden', 'error');
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        showMessage('register-message', 'La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    const userData = {
        name: formData.get('name'),
        lastname: formData.get('lastname'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: password,
        newsletter: document.getElementById('newsletter').checked
    };

    try {
        const newUser = db.register(userData);
        db.setCurrentUser(newUser);
        
        showSection(successSection);
        
    } catch (error) {
        showMessage('register-message', error.message, 'error');
    }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = db.getCurrentUser();
    if (currentUser && window.location.pathname.includes('auth.html')) {
        // User is already logged in, redirect to main page
        window.location.href = 'index.html';
    }
});

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Real-time validation
document.getElementById('register-email').addEventListener('blur', (e) => {
    if (!validateEmail(e.target.value)) {
        e.target.style.borderColor = '#ff6b6b';
    } else {
        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    }
});

document.getElementById('confirm-password').addEventListener('input', (e) => {
    const password = document.getElementById('register-password').value;
    if (e.target.value && e.target.value !== password) {
        e.target.style.borderColor = '#ff6b6b';
    } else {
        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    }
});