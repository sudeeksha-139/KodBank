# 🔐 KODBANK - JAVASCRIPT CODE DOCUMENTATION

## Frontend JavaScript Explained

---

## 📄 File: `frontend/js/auth.js`

### **Purpose**
Handles user registration and login functionality on the frontend.

### **Variables**

```javascript
const API_URL = 'http://localhost:5001/api';
```
- **What**: Base URL for all API calls
- **Why**: Centralized configuration for easy changes
- **Used in**: All fetch requests to backend

### **Functions**

#### **1. handleRegister(e)**

```javascript
async function handleRegister(e) {
  e.preventDefault();  // Stop form from refreshing page
  
  // Get values from form inputs
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value.trim();
  
  // Validation: Check if fields are empty
  if (!username || !email || !password || !phone) {
    showError('Please fill in all fields', errorDiv);
    return;
  }
  
  // Validation: Check password length
  if (password.length < 6) {
    showError('Password must be at least 6 characters', errorDiv);
    return;
  }
  
  // Send to backend
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uid: null,
      username: username,
      email: email,
      password: password,
      phone: phone,
      role: 'Customer'  // Only Customer allowed
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    alert('Registration successful! Redirecting to login...');
    window.location.href = 'login.html';  // Redirect to login
  } else {
    showError(data.message || 'Registration failed', errorDiv);
  }
}
```

**Flow Diagram:**
```
User submits form
        │
        ▼
Validate inputs
        │
        ├─ Check not empty
        └─ Check password length ≥ 6
        │
        ▼
Send POST to /api/auth/register
        │
        ▼
Backend creates user
        │
        ▼
Response received
        │
        ├─ Success → Redirect to login
        └─ Error → Show error message
```

#### **2. handleLogin(e)**

```javascript
async function handleLogin(e) {
  e.preventDefault();
  
  // Get form values
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  
  // Validation
  if (!username || !password) {
    showError('Please enter username and password', errorDiv);
    return;
  }
  
  // Send to backend
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',  // Include cookies in request
    body: JSON.stringify({
      username: username,
      password: password
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Save token for later use
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    
    // Redirect to dashboard
    alert('Login successful! Redirecting to dashboard...');
    window.location.href = 'dashboard.html';
  } else {
    // Show error if credentials invalid
    showError(data.message || 'Login failed', errorDiv);
  }
}
```

**What Happens:**
```
1. User enters username & password
2. Send to backend
3. Backend checks database
4. If match:
   - Generate JWT token
   - Return token
   - Frontend saves token
   - Redirect to dashboard
5. If no match:
   - Return error
   - Show on page
```

#### **3. showError(message, element)**

```javascript
function showError(message, element) {
  if (element) {
    element.textContent = message;
    element.classList.add('show');  // Add CSS class to display
  } else {
    console.error(message);
  }
}
```

**Purpose**: Display error messages to user

---

## 📄 File: `frontend/js/dashboard.js`

### **Purpose**
Handles dashboard functionality and JWT token verification for balance checking.

### **Key Functions**

#### **1. Initialization (on page load)**

```javascript
window.addEventListener('load', () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  
  if (!token || !username) {
    // No login → redirect to login page
    alert('You are not logged in. Redirecting to login page...');
    window.location.href = 'login.html';
  } else {
    // User logged in → show welcome message
    welcomeText.textContent = `Welcome, ${username}!`;
  }
  
  // Add click handlers
  if (checkBalanceBtn) {
    checkBalanceBtn.addEventListener('click', fetchBalance);
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});
```

**Security Check:**
```
Is JWT token in localStorage?
├─ YES → Welcome user, proceed
└─ NO → Redirect to login (This way, unlogged users can't access)
```

#### **2. fetchBalance()**

**Most Important Function** - Gets user's balance with JWT verification

```javascript
async function fetchBalance() {
  // Hide previous messages
  if (errorMessage) {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
  }
  
  // Show loading spinner
  if (loadingSpinner) {
    loadingSpinner.style.display = 'flex';
  }
  
  try {
    // Get token from storage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }
    
    // Send request with JWT token in Authorization header
    const response = await fetch(`${API_URL}/user/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // ← JWT token sent here
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    // Hide loading
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }
    
    if (data.success) {
      // Display balance
      displayBalance(data.balance);
      
      // Celebrate! 🎉
      triggerCelebration();
    } else {
      // Check if token expired
      if (data.message.includes('expired') || data.message.includes('Invalid')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        alert('Your session has expired. Please login again.');
        window.location.href = 'login.html';
      } else {
        showError(data.message || 'Failed to fetch balance');
      }
    }
  } catch (error) {
    console.error('Balance fetch error:', error);
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }
    showError(error.message || 'An error occurred while fetching your balance');
  }
}
```

**How JWT Token Works Here:**
```
1. Frontend: Get token from localStorage
2. Frontend: Add to Authorization header
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
3. Send GET request to /api/user/balance
4. Backend receives:
   - Extracts token from header
   - Verifies signature using JWT_SECRET
   - If valid → Get balance & return
   - If invalid/expired → Return error
5. Frontend:
   - If error saying "expired" → Delete token & redirect to login
   - If success → Show balance and confetti
```

#### **3. displayBalance(balance)**

```javascript
function displayBalance(balance) {
  // Format as currency: 100000 → ₹100000.00
  if (balanceAmount) {
    balanceAmount.textContent = `₹${parseFloat(balance).toFixed(2)}`;
  }
  
  // Show success message
  if (balanceMessage) {
    balanceMessage.textContent = '✓ Your balance has been verified securely';
  }
  
  // Make element visible
  if (balanceDisplay) {
    balanceDisplay.style.display = 'block';
  }
}
```

**Purpose**: Format and display the balance on page

#### **4. triggerCelebration()**

```javascript
function triggerCelebration() {
  // Get confetti container
  const confettiContainer = document.getElementById('confettiContainer');
  if (!confettiContainer) return;
  
  // Create 50 confetti pieces
  for (let i = 0; i < 50; i++) {
    const confetto = document.createElement('div');
    confetto.className = 'confetti';
    
    // Random colors
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    confetto.style.backgroundColor = randomColor;
    
    // Random starting position (x-axis)
    confetto.style.left = Math.random() * window.innerWidth + 'px';
    confetto.style.top = '-10px';
    
    // Random animation duration (2-3 seconds)
    const duration = 2 + Math.random() * 1;
    confetto.style.animationDuration = duration + 's';
    
    // Add to page
    confettiContainer.appendChild(confetto);
    
    // Remove after animation completes
    setTimeout(() => {
      confetto.remove();
    }, duration * 1000);
  }
}
```

**What Happens:**
```
1. Create 50 colored div elements
2. Position randomly at top of screen
3. Start animation (fall down & rotate)
4. After animation → remove from page
Result: Confetti falling effect! 🎉
```

#### **5. handleLogout()**

```javascript
async function handleLogout() {
  try {
    const token = localStorage.getItem('token');
    
    // Optional: Tell backend to invalidate token
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    // Clear stored token
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    // Redirect home
    alert('Logged out successfully!');
    window.location.href = 'index.html';
  } catch (error) {
    // Even if request fails, clear local data
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
  }
}
```

**Security:** Even if logout request fails, we still remove the token from localStorage.

---

## 🔄 Complete User Journey with Code

### **Step 1: Registration**

```
User clicks "Register" link
            ↓
register.html loads
            ↓
User fills form & clicks "Register"
            ↓
handleRegister() runs
    ├─ Validate inputs
    ├─ POST to /api/auth/register
    └─ Backend creates user
            ↓
Response received
    ├─ Success → Redirect to login.html
    └─ Error → Show error message
```

### **Step 2: Login**

```
User goes to login.html
            ↓
User enters credentials & clicks Login
            ↓
handleLogin() runs
    ├─ Validate inputs
    ├─ POST to /api/auth/login
    └─ Backend generates JWT
            ↓
Backend returns JWT token
            ↓
Frontend saves:
    ├─ localStorage.setItem('token', JWT)
    └─ localStorage.setItem('username', username)
            ↓
Redirect to dashboard.html
```

### **Step 3: Dashboard Load**

```
dashboard.html loads
            ↓
window 'load' event triggers
            ↓
JavaScript checks:
    ├─ Get token from localStorage
    └─ Get username from localStorage
            ↓
Token exists?
    ├─ YES → Show welcome & buttons ✓
    └─ NO → Redirect to login ✗
```

### **Step 4: Check Balance**

```
User clicks "Check Your Balance"
            ↓
fetchBalance() runs
    ├─ Get token from localStorage
    ├─ GET /api/user/balance
    │  Header: Authorization: Bearer {token}
    └─ Send request
            ↓
Backend receives
    ├─ auth.js middleware
    │  ├─ Extract token
    │  ├─ Verify JWT signature
    │  └─ Check expiry
    └─ userController.getBalance()
       └─ Query database
            ↓
Backend returns balance
            ↓
Frontend receives response
    ├─ Check if success
    ├─ displayBalance(balance)
    └─ triggerCelebration()
            ↓
User sees: ₹100000.00 + 🎉 Confetti
```

---

## 🛡️ Security in Frontend Code

### **1. Token Storage**

```javascript
// Save token after login
localStorage.setItem('token', data.token);
```
- Used to remember user across page refreshes
- Client-side storage

### **2. Token Verification**

```javascript
// Check token exists before accessing protected page
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}
```
- Prevents unauthorized access
- Redirects to login if no token

### **3. Token Expiry Handling**

```javascript
if (data.message.includes('expired') || data.message.includes('Invalid')) {
  localStorage.removeItem('token');
  alert('Your session has expired. Please login again.');
  window.location.href = 'login.html';
}
```
- Detects expired tokens
- Clears storage
- Forces re-login

### **4. Secure Token Transmission**

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```
- Token sent in Authorization header (not in URL)
- Uses Bearer scheme (standard)

---

## ✅ Key Takeaways

1. **Frontend validates** inputs before sending
2. **Backend validates** inputs again (never trust frontend!)
3. **JWT token** sent with every API request
4. **Token expiry** handled automatically
5. **UI updates** based on response
6. **Error handling** for all scenarios
7. **Session management** with localStorage

This is production-ready code! 🚀

