// Dashboard JavaScript
const API_URL = '/api';

// DOM Elements
const checkBalanceBtn = document.getElementById('checkBalanceBtn');
const logoutBtn = document.getElementById('logoutBtn');
const balanceDisplay = document.getElementById('balanceDisplay');
const balanceAmount = document.getElementById('balanceAmount');
const balanceMessage = document.getElementById('balanceMessage');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const welcomeText = document.getElementById('welcomeText');

// Initialize dashboard
window.addEventListener('load', () => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  
  if (!token || !username) {
    alert('You are not logged in. Redirecting to login page...');
    window.location.href = 'login.html';
  } else {
    // Update welcome message
    welcomeText.textContent = `Welcome, ${username}!`;
  }
  
  // Add event listeners
  if (checkBalanceBtn) {
    checkBalanceBtn.addEventListener('click', fetchBalance);
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

/**
 * Fetch user balance from backend
 * With JWT token verification
 */
async function fetchBalance() {
  // Hide previous error message
  if (errorMessage) {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
  }
  
  // Show loading state
  if (loadingSpinner) {
    loadingSpinner.style.display = 'flex';
  }
  if (balanceDisplay) {
    balanceDisplay.style.display = 'none';
  }
  
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }
    
    // Send balance request with JWT token
    const response = await fetch(`${API_URL}/user/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    // Hide loading state
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }
    
    if (data.success) {
      // Display balance with animation
      displayBalance(data.balance);
      
      // Show celebration effects
      triggerCelebration();
    } else {
      // Handle token expiry or invalid token
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

/**
 * Display balance information
 */
function displayBalance(balance) {
  if (balanceAmount) {
    balanceAmount.textContent = `₹${parseFloat(balance).toFixed(2)}`;
  }
  
  if (balanceMessage) {
    balanceMessage.textContent = '✓ Your balance has been verified securely';
  }
  
  if (balanceDisplay) {
    balanceDisplay.style.display = 'block';
  }
}

/**
 * Trigger celebration effects (confetti)
 */
function triggerCelebration() {
  // Create confetti effect
  const confettiContainer = document.getElementById('confettiContainer');
  if (!confettiContainer) return;
  
  // Create multiple confetti pieces
  for (let i = 0; i < 50; i++) {
    const confetto = document.createElement('div');
    confetto.className = 'confetti';
    
    // Random colors
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    confetto.style.backgroundColor = randomColor;
    
    // Random position
    confetto.style.left = Math.random() * window.innerWidth + 'px';
    confetto.style.top = '-10px';
    
    // Random animation duration
    const duration = 2 + Math.random() * 1;
    confetto.style.animationDuration = duration + 's';
    
    confettiContainer.appendChild(confetto);
    
    // Remove confetto after animation
    setTimeout(() => {
      confetto.remove();
    }, duration * 1000);
  }
}

/**
 * Show error message
 */
function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
  } else {
    alert(message);
  }
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    const token = localStorage.getItem('token');
    
    // Send logout request (optional, for cleanup)
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    // Redirect to home page
    alert('Logged out successfully!');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect even if logout request fails
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
  }
}
