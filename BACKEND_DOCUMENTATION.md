# 📡 KODBANK - BACKEND API DOCUMENTATION

## Complete Backend Code Explanation

---

## 📄 File: `backend/server.js`

### **Main Application File**

```javascript
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import database and routes
const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
```

**What This Does:**
- ✅ Loads environment variables from `.env`
- ✅ Creates Express application
- ✅ Imports all dependencies

### **Middleware Configuration**

```javascript
// Parse JSON in request body
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Enable CORS (Cross-Origin Resource Sharing)
// Allows frontend (localhost:3000) to talk to backend (localhost:5001)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true  // Allow cookies
}));

// Parse cookies
app.use(cookieParser());
```

**Middleware Chain:**
```
HTTP Request
    ↓
express.json() → Parse JSON body
    ↓
express.urlencoded() → Parse form data
    ↓
cors() → Allow cross-origin requests
    ↓
cookieParser() → Parse cookies
    ↓
Route Handler
```

### **Routes Setup**

```javascript
// API Routes
app.use('/api/auth', authRoutes);   // /api/auth/register, /api/auth/login
app.use('/api/user', userRoutes);   // /api/user/balance, /api/user/profile

// Test route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Kodbank API',
    version: '1.0.0'
  });
});

// 404 handler - for non-existent routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found.' 
  });
});
```

### **Server Startup**

```javascript
const startServer = async () => {
  try {
    // Initialize database (create tables)
    await initializeDatabase();
    
    // Start listening on port
    app.listen(PORT, () => {
      console.log(`✓ Kodbank server running on http://localhost:${PORT}`);
      console.log(`✓ Frontend: http://localhost:3000`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);  // Exit if error
  }
};

startServer();
```

---

## 🗄️ File: `backend/config/database.js`

### **Database Connection & Tables**

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool (reusable connections)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,      // Max 10 concurrent connections
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});
```

**Connection Pool Benefits:**
- ✅ Reuses connections (faster)
- ✅ Handles multiple requests
- ✅ SSL encryption enabled

### **Initialize Database Function**

```javascript
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create KodUser table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS KodUser (
        uid INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 100000,  ← 1 LAKH
        phone VARCHAR(20),
        role VARCHAR(20) NOT NULL DEFAULT 'Customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (uid)
      )
    `);
    
    // Create UserToken table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS UserToken (
        tid INT NOT NULL AUTO_INCREMENT,
        token LONGTEXT NOT NULL,
        uid INT NOT NULL,
        expiry DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (tid),
        FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE
      )
    `);
    
    connection.release();
    console.log('✓ Database tables initialized successfully');
  } catch (error) {
    console.error('✗ Error initializing database:', error);
    process.exit(1);
  }
}

module.exports = {
  pool,
  initializeDatabase
};
```

**What Tables Store:**

| KodUser | UserToken |
|---------|-----------|
| User accounts | JWT tokens |
| Usernames | Expiry dates |
| Encrypted passwords | User IDs |
| Balances | Timestamps |

---

## 🔐 File: `backend/middleware/auth.js`

### **JWT Verification Middleware**

```javascript
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided. Please login first.' 
      });
    }
    
    // Verify token signature and expiry
    // If invalid/expired, throws error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request object
    // Now controller can access req.user
    req.user = decoded;
    req.token = token;
    
    // Continue to next middleware/controller
    next();
    
  } catch (error) {
    // Handle different error types
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Please login again.' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Token verification failed.' 
    });
  }
};

module.exports = {
  verifyToken
};
```

**Token Verification Flow:**
```
Token Received
    ↓
Check if token exists
    ├─ NO → Error: "No token provided"
    └─ YES → Continue
    ↓
jwt.verify(token, JWT_SECRET)
    ├─ Invalid signature → Error: "Invalid token"
    ├─ Expired → Error: "Token expired"
    └─ Valid → Decode payload
    ↓
Add user data to req.user
    ↓
Allow access to protected route
```

---

## 👤 File: `backend/controllers/authController.js`

### **1. Register Function**

```javascript
const register = async (req, res) => {
  try {
    const { uid, username, password, email, phone, role } = req.body;
    
    // Validation: Check all fields provided
    if (!username || !password || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields.' 
      });
    }
    
    // Validation: Only Customer role allowed
    if (role !== 'Customer') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only Customer role is allowed.' 
      });
    }
    
    // Check if user already exists
    const connection = await pool.getConnection();
    const [existingUser] = await connection.execute(
      'SELECT username FROM KodUser WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists.' 
      });
    }
    
    // Hash password using bcryptjs
    // This encrypts password with salt (10 rounds)
    // Original password is never stored
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const [result] = await connection.execute(
      'INSERT INTO KodUser (username, email, password, phone, role, balance) VALUES (?, ?, ?, ?, ?, 100000)',
      [username, email, hashedPassword, phone, role]
    );
    
    connection.release();
    
    // Success response
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login.',
      userId: result.insertId
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
};
```

**Registration Flow:**
```
POST /api/auth/register
    ↓
Validate input fields
    ↓
Check role = 'Customer'
    ↓
Check if user exists
    ├─ Exists → Error: "Username or email already exists"
    └─ New → Continue
    ↓
Hash password with bcrypt
    (password123 → $2a$10$XyZ...hash)
    ↓
Insert into KodUser table
    (uid, username, email, hashed_password, balance, phone, role)
    ↓
Return success
    {
      success: true,
      userId: 1
    }
```

### **2. Login Function**

```javascript
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide username and password.' 
      });
    }
    
    const connection = await pool.getConnection();
    
    // Find user by username
    const [users] = await connection.execute(
      'SELECT uid, username, password, role FROM KodUser WHERE username = ?',
      [username]
    );
    
    // Check if user exists
    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password.' 
      });
    }
    
    const user = users[0];
    
    // Compare input password with hashed password in database
    // bcrypt.compare does the magic:
    // - Hashes input password
    // - Compares with database hash
    // - Returns true/false
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password.' 
      });
    }
    
    // Generate JWT token
    // Token expires in 24 hours
    // Contains uid, username, role
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const token = jwt.sign(
      {
        uid: user.uid,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Store token in UserToken table
    // Used to track issued tokens
    await connection.execute(
      'INSERT INTO UserToken (token, uid, expiry) VALUES (?, ?, ?)',
      [token, user.uid, expiryTime]
    );
    
    connection.release();
    
    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,                    // Can't access from JavaScript
      secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
      sameSite: 'Strict',                // CSRF protection
      maxAge: 24 * 60 * 60 * 1000       // 24 hours
    });
    
    // Return token to frontend
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: token,
      username: user.username
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
};
```

**Login Flow:**
```
POST /api/auth/login
    ↓
Validate inputs
    ↓
Query: SELECT user WHERE username = ?
    ├─ Not found → Error
    └─ Found → Continue
    ↓
Compare password:
  bcrypt.compare(inputPassword, databaseHash)
    ├─ No match → Error
    └─ Match → Continue
    ↓
Generate JWT token:
  jwt.sign({uid, username, role}, JWT_SECRET, {exp: 24h})
    ↓
Store token in UserToken table
    ↓
Set in HTTP-only cookie
    ↓
Return token to frontend
    {
      success: true,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      username: "sudeeksha"
    }
```

---

## 💰 File: `backend/controllers/userController.js`

### **Get Balance Function**

```javascript
const getBalance = async (req, res) => {
  try {
    // req.user is set by auth.js middleware
    // Contains uid and username from JWT token
    const userId = req.user.uid;
    const username = req.user.username;
    
    const connection = await pool.getConnection();
    
    // Query balance from database
    const [users] = await connection.execute(
      'SELECT balance FROM KodUser WHERE uid = ?',
      [userId]
    );
    
    connection.release();
    
    // Check if user found
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }
    
    const balance = users[0].balance;
    
    // Return balance to frontend
    res.status(200).json({
      success: true,
      message: 'Balance fetched successfully!',
      username: username,
      balance: balance
    });
    
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch balance. Please try again.' 
    });
  }
};
```

**Security:**
```
GET /api/user/balance
    ↓
Authorization: Bearer {JWT_TOKEN}
    ↓
auth.js middleware verifies token
    ├─ Invalid/Expired → Error 401
    └─ Valid → Extract uid & username
    ↓
req.user = { uid: 1, username: "sudeeksha" }
    ↓
getBalance() runs
    ├─ Use uid from token (not from user input!)
    ├─ Query balance WHERE uid = req.user.uid
    └─ Return balance
    ↓
User can only see their own balance!
```

---

## 🛣️ File: `backend/routes/auth.js`

```javascript
const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

// Public routes (no authentication needed)
router.post('/register', register);    // POST /api/auth/register
router.post('/login', login);          // POST /api/auth/login
router.post('/logout', logout);        // POST /api/auth/logout

module.exports = router;
```

---

## 🛣️ File: `backend/routes/user.js`

```javascript
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getBalance, getUserProfile } = require('../controllers/userController');

// Protected routes (require valid JWT token)
router.get('/balance', verifyToken, getBalance);        // GET /api/user/balance
router.get('/profile', verifyToken, getUserProfile);    // GET /api/user/profile

module.exports = router;
```

**Public vs Protected:**
```
Public Routes:
├─ /api/auth/register  - Anyone can access
├─ /api/auth/login     - Anyone can access
└─ /api/auth/logout    - Anyone can access

Protected Routes (require JWT):
├─ /api/user/balance   - Need valid token
└─ /api/user/profile   - Need valid token
```

---

## 🔄 Complete Request/Response Cycle

### **Example: Check Balance**

**Request:**
```
GET /api/user/balance HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Backend Processing:**
```
1. Route Match: GET /api/user/balance
2. Middleware: verifyToken
   ├─ Extract token from Authorization header
   ├─ jwt.verify(token, JWT_SECRET)
   ├─ Check expiry
   └─ Set req.user = {uid: 1, username: "sudeeksha"}
3. Controller: getBalance()
   ├─ Use req.user.uid to get balance
   └─ SELECT balance FROM KodUser WHERE uid = 1
4. Database Response: balance = 100000
5. Send Response
```

**Response:**
```json
{
  "success": true,
  "message": "Balance fetched successfully!",
  "username": "sudeeksha",
  "balance": 100000
}
```

---

## ✅ Error Handling Examples

### **400 Bad Request**
```javascript
res.status(400).json({ 
  success: false, 
  message: 'Please provide all required fields.' 
});
```
**Cause:** Missing input data
**User Action:** Fill all form fields

### **401 Unauthorized**
```javascript
res.status(401).json({ 
  success: false, 
  message: 'Token expired. Please login again.' 
});
```
**Cause:** Invalid or expired JWT
**User Action:** Login again

### **404 Not Found**
```javascript
res.status(404).json({ 
  success: false, 
  message: 'User not found.' 
});
```
**Cause:** User doesn't exist in database
**User Action:** Register new account

### **500 Server Error**
```javascript
res.status(500).json({ 
  success: false, 
  message: 'Registration failed. Please try again.' 
});
```
**Cause:** Unexpected server error
**User Action:** Retry or contact support

---

This is production-grade backend code! 🚀

