// Authentication JavaScript
const API_URL = '/api';

// Handle Registration Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', handleRegister);
}

// Handle Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

/**
 * Handle User Registration
 * Sends user data to backend and creates new user account
 */
async function handleRegister(e) {
  e.preventDefault();
  const errorDiv = document.getElementById('errorMessage');
  
  // Clear previous error messages
  if (errorDiv) {
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
  }
  
  // Get form values
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value.trim();
  
  // Validation
  if (!username || !email || !password || !phone) {
    showError('Please fill in all fields', errorDiv);
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters', errorDiv);
    return;
  }
  
  try {
    // Send registration request to backend
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid: null, // Database will auto-generate
        username: username,
        email: email,
        password: password,
        phone: phone,
        role: 'Customer' // Only Customer role allowed
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Registration successful! Redirecting to login...');
      window.location.href = 'login.html';
    } else {
      showError(data.message || 'Registration failed', errorDiv);
    }
  } catch (error) {
    console.error('Registration error:', error);
    showError('An error occurred during registration. Please try again.', errorDiv);
  }
}

/**
 * Handle User Login
 * Validates credentials and stores JWT token
 */
async function handleLogin(e) {
  e.preventDefault();
  const errorDiv = document.getElementById('errorMessage');
  
  // Clear previous error messages
  if (errorDiv) {
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
  }
  
  // Get form values
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  
  // Validation
  if (!username || !password) {
    showError('Please enter username and password', errorDiv);
    return;
  }
  
  try {
    // Send login request to backend
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      
      // Redirect to dashboard
      alert('Login successful! Redirecting to dashboard...');
      window.location.href = 'dashboard.html';
    } else {
      showError(data.message || 'Login failed', errorDiv);
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('An error occurred during login. Please try again.', errorDiv);
  }
}

/**
 * Display error message
 */
function showError(message, element) {
  if (element) {
    element.textContent = message;
    element.classList.add('show');
  } else {
    console.error(message);
  }
}
