# 🏗️ KODBANK - PROJECT ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     KODBANK APPLICATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐        ┌──────────────────┐               │
│  │  FRONTEND LAYER  │        │  BACKEND LAYER   │               │
│  │ (Port 3000)      │◄──────►│ (Port 5001)      │               │
│  │                  │        │                  │               │
│  │ • HTML Pages     │        │ • Express Server │               │
│  │ • CSS Styling    │        │ • Route Handlers │               │
│  │ • JavaScript     │        │ • Middleware     │               │
│  │ • LocalStorage   │        │ • Controllers    │               │
│  └──────────────────┘        └──────────────────┘               │
│         │                              │                        │
│         └──────────────────┬───────────┘                        │
│                            │                                     │
│                  ┌─────────▼────────┐                           │
│                  │   REST API       │                           │
│                  │   (HTTP/JSON)    │                           │
│                  └─────────┬────────┘                           │
│                            │                                     │
│                  ┌─────────▼──────────────┐                     │
│                  │  AIVEN MYSQL DATABASE  │                     │
│                  │ (Cloud - Port 24115)   │                     │
│                  │                        │                     │
│                  │ • KodUser Table        │                     │
│                  │ • UserToken Table      │                     │
│                  └────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure Explained

```
kodnestPayment/
│
├── backend/                          # Node.js/Express Server
│   ├── config/
│   │   └── database.js              # MySQL Connection & Table Creation
│   │       ├─ Creates connection pool
│   │       ├─ Initializes KodUser table
│   │       └─ Initializes UserToken table
│   │
│   ├── middleware/
│   │   └── auth.js                  # JWT Verification Middleware
│   │       ├─ Verifies token signature
│   │       ├─ Checks token expiry
│   │       └─ Extracts user from token
│   │
│   ├── controllers/
│   │   ├── authController.js        # Authentication Logic
│   │   │   ├─ register() - Create new user
│   │   │   ├─ login() - Authenticate user & generate JWT
│   │   │   └─ logout() - Clear token
│   │   │
│   │   └── userController.js        # User Operations
│   │       ├─ getBalance() - Fetch user balance
│   │       └─ getUserProfile() - Fetch user info
│   │
│   ├── routes/
│   │   ├── auth.js                  # Authentication Routes
│   │   │   ├─ POST /api/auth/register
│   │   │   ├─ POST /api/auth/login
│   │   │   └─ POST /api/auth/logout
│   │   │
│   │   └── user.js                  # User Routes (Protected)
│   │       ├─ GET /api/user/balance
│   │       └─ GET /api/user/profile
│   │
│   ├── server.js                    # Main Application Entry
│   │   ├─ Initialize Express app
│   │   ├─ Setup middleware (CORS, JSON parsing)
│   │   ├─ Connect routes
│   │   ├─ Initialize database
│   │   └─ Start server on port 5001
│   │
│   ├── .env                         # Environment Variables
│   │   ├─ Database credentials
│   │   ├─ JWT secret key
│   │   └─ Port configuration
│   │
│   └── package.json                 # Dependencies
│       ├─ express, mysql2
│       ├─ bcryptjs, jsonwebtoken
│       └─ dotenv, cors, cookie-parser
│
├── frontend/                         # Static Web Application
│   ├── index.html                   # Landing Page
│   │   └─ Features overview
│   │
│   ├── register.html                # Registration Form
│   │   ├─ username, email, password inputs
│   │   └─ Links to login page
│   │
│   ├── login.html                   # Login Form
│   │   ├─ username, password inputs
│   │   └─ Links to registration
│   │
│   ├── dashboard.html               # User Dashboard (Protected)
│   │   ├─ Welcome message
│   │   ├─ Check Balance button
│   │   ├─ Balance display
│   │   └─ Logout button
│   │
│   ├── css/
│   │   └── styles.css               # All Styling
│   │       ├─ Page layouts
│   │       ├─ Animations & transitions
│   │       ├─ Responsive design
│   │       ├─ Gradient backgrounds
│   │       └─ Confetti animation
│   │
│   └── js/
│       ├── auth.js                  # Authentication Logic
│       │   ├─ handleRegister() - Registration form submission
│       │   ├─ handleLogin() - Login form submission
│       │   └─ API calls to backend
│       │
│       └── dashboard.js             # Dashboard Logic
│           ├─ fetchBalance() - Get balance from backend
│           ├─ triggerCelebration() - Confetti animation
│           ├─ handleLogout() - User logout
│           └─ JWT token verification on every request
│
└── README.md                        # Project Documentation
```

---

## 🔄 Data Flow Architecture

### 1. **Registration Flow**

```
User Form Input
      │
      ▼
Frontend (HTML Form)
      │ validate inputs
      ▼
JavaScript (auth.js)
      │ POST /api/auth/register
      ▼
Backend Server
      │
      ├─► Check if email exists
      ├─► Hash password with bcrypt
      ├─► Create user in database
      └─► Return success/error
      
      ▼
Frontend
      │ if success → redirect to login
      └─ if error → show error message
```

### 2. **Login Flow**

```
User Credentials
      │
      ▼
Frontend (HTML Form)
      │ validate inputs
      ▼
JavaScript (auth.js)
      │ POST /api/auth/login
      ▼
Backend Server
      │
      ├─► Find user by username
      ├─► Verify password (bcrypt compare)
      ├─► Generate JWT Token
      │   ├─ Sign with JWT_SECRET
      │   ├─ Include uid, username, role, expiry
      │   └─ Set 24-hour expiry
      ├─► Store token in UserToken table
      └─► Return token to frontend
      
      ▼
Frontend
      │ save token in localStorage
      │ save token in cookie
      └─ redirect to dashboard
```

### 3. **Balance Check Flow**

```
User clicks "Check Balance"
      │
      ▼
JavaScript (dashboard.js)
      │ GET /api/user/balance
      │ Authorization: Bearer {token}
      ▼
Backend Server
      │ Middleware: auth.js
      │   ├─ Extract token from header
      │   ├─ Verify JWT signature
      │   ├─ Check token expiry
      │   └─ Extract user info
      │
      ├─► User verified ✓
      │
      ▼
userController.getBalance()
      │
      ├─► Query KodUser table
      │   WHERE uid = ?
      │
      ▼
Return Balance
      │
      ▼
Frontend receives balance
      │
      ├─► Display balance
      ├─► Trigger confetti animation
      └─► Show success message
```

---

## 🗄️ Database Architecture

### **Table 1: KodUser**

```
KodUser Table
┌─────────────────────────────────────────────┐
│ uid (PK, AUTO_INCREMENT)                    │
├─────────────────────────────────────────────┤
│ username (UNIQUE, NOT NULL)                 │
├─────────────────────────────────────────────┤
│ email (UNIQUE, NOT NULL)                    │
├─────────────────────────────────────────────┤
│ password (ENCRYPTED WITH BCRYPT)            │
├─────────────────────────────────────────────┤
│ balance (DEFAULT: 100000)                   │
├─────────────────────────────────────────────┤
│ phone (NOT NULL)                            │
├─────────────────────────────────────────────┤
│ role (DEFAULT: 'Customer')                  │
├─────────────────────────────────────────────┤
│ created_at (TIMESTAMP)                      │
└─────────────────────────────────────────────┘

Sample Data:
┌─────┬──────────┬──────────────────┬──────────────────────┬─────────┬──────────────┬──────────┬───────────────────┐
│ uid │ username │ email            │ password (bcrypt)    │ balance │ phone        │ role     │ created_at        │
├─────┼──────────┼──────────────────┼──────────────────────┼─────────┼──────────────┼──────────┼───────────────────┤
│ 1   │ sudeeksha│ sudee@example.com│ $2a$10$XyZ...hash   │ 100000  │ 9876543210   │ Customer │ 2026-02-22 10:30:00│
│ 2   │ radhika  │ radhi@example.com│ $2a$10$AbC...hash   │ 100000  │ 9988776655   │ Customer │ 2026-02-22 11:15:00│
└─────┴──────────┴──────────────────┴──────────────────────┴─────────┴──────────────┴──────────┴───────────────────┘
```

### **Table 2: UserToken**

```
UserToken Table
┌─────────────────────────────────────────────┐
│ tid (PK, AUTO_INCREMENT)                    │
├─────────────────────────────────────────────┤
│ token (JWT TOKEN - LONGTEXT)                │
├─────────────────────────────────────────────┤
│ uid (FK → KodUser.uid)                      │
├─────────────────────────────────────────────┤
│ expiry (DATETIME - 24 hours from creation)  │
├─────────────────────────────────────────────┤
│ created_at (TIMESTAMP)                      │
└─────────────────────────────────────────────┘

Sample Data:
┌─────┬──────────────────────────────────────┬─────┬───────────────────────┬───────────────────────┐
│ tid │ token                                │ uid │ expiry                │ created_at            │
├─────┼──────────────────────────────────────┼─────┼───────────────────────┼───────────────────────┤
│ 1   │ eyJhbGciOiJIUzI1NiIsIn...           │ 1   │ 2026-02-23 10:30:00   │ 2026-02-22 10:30:00   │
│ 2   │ eyJhbGciOiJIUzI1NiIsIn...           │ 2   │ 2026-02-23 11:15:00   │ 2026-02-22 11:15:00   │
└─────┴──────────────────────────────────────┴─────┴───────────────────────┴───────────────────────┘
```

---

## 🔐 Security Architecture

### **Password Encryption (bcryptjs)**

```
User Input: "password123"
        │
        ▼
bcryptjs.hash(password, 10)
        │
        ├─ Generate random salt (10 rounds)
        ├─ Hash password with salt
        └─ Return: $2a$10$XyZ123...hashedvalue
        
Stored in Database: $2a$10$XyZ123...hashedvalue
        │
        (Original password NOT stored)
        │
On Login:
        │
bcryptjs.compare(inputPassword, hashFromDB)
        ├─ Hash input password
        ├─ Compare with database hash
        └─ Return: true/false
```

### **JWT Token Structure**

```
Header (Algorithm & Type)
{
  "alg": "HS256",
  "typ": "JWT"
}
        .
Payload (User Data)
{
  "uid": 1,
  "username": "sudeeksha",
  "role": "Customer",
  "iat": 1645507200,
  "exp": 1645593600
}
        .
Signature (Secret Key Verification)
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)

Complete Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInVzZXJuYW1lIjoic3VkZWVrc2hhIn0.ABC123XYZ...
```

### **Token Verification Process**

```
Frontend sends token:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        │
        ▼
Backend receives request
        │ auth.js middleware
        ▼
Extract token from Authorization header
        │
        ▼
jwt.verify(token, JWT_SECRET)
        │
        ├─ Decode payload
        ├─ Verify signature (recreate with JWT_SECRET)
        ├─ Check expiry (current time < exp)
        └─ Return decoded payload OR throw error
        
If valid ✓:
        └─ Proceed with request
        
If invalid ✗:
        ├─ TokenExpiredError → "Token expired. Please login again."
        ├─ JsonWebTokenError → "Invalid token. Please login again."
        └─ Return 401 Unauthorized
```

---

## 🌐 API Communication Architecture

```
FRONTEND REQUEST
{
  method: "GET",
  url: "http://localhost:5001/api/user/balance",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
        │
        ▼
BACKEND PROCESSING
        │
        ├─ Receive HTTP request
        ├─ Match route: GET /api/user/balance
        ├─ Check middleware (auth.js)
        │   └─ Verify JWT token
        │
        └─ Call Controller: userController.getBalance()
           ├─ Extract uid from token
           ├─ Query database: SELECT balance FROM KodUser WHERE uid = ?
           └─ Return balance
        │
        ▼
BACKEND RESPONSE
{
  success: true,
  message: "Balance fetched successfully!",
  username: "sudeeksha",
  balance: 100000
}
        │
        ▼
FRONTEND DISPLAY
Display: ₹100000.00
Show: "Your balance has been verified securely"
Animation: Confetti 🎉
```

---

## 🔄 Middleware Chain

```
HTTP Request
        │
        ▼
Express Middleware Chain
        │
        ├─► express.json()
        │   └─ Parse JSON body
        │
        ├─► express.urlencoded()
        │   └─ Parse form data
        │
        ├─► cors()
        │   └─ Allow cross-origin requests
        │
        ├─► cookieParser()
        │   └─ Parse cookies
        │
        ├─► Route Handler
        │   │
        │   └─► auth.js middleware (if protected route)
        │       ├─ Get token from header/cookie
        │       ├─ Verify JWT
        │       ├─ Add req.user
        │       └─ Pass to controller
        │
        └─► Controller
            └─ Business logic
            
        ▼
HTTP Response
```

---

## 📊 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5 | Markup structure |
| | CSS3 | Styling & animations |
| | JavaScript ES6 | Interactivity |
| | Fetch API | HTTP requests |
| **Backend** | Node.js | Runtime |
| | Express.js | Web framework |
| | Middleware | Request processing |
| **Database** | MySQL | Data storage |
| | mysql2 | Database driver |
| **Security** | bcryptjs | Password hashing |
| | jsonwebtoken | Token generation |
| | dotenv | Environment config |
| **DevOps** | Aiven | Cloud database |
| | CORS | Cross-origin |
| | SSL/TLS | Encryption |

---

## 🚀 Deployment Architecture (Cloud Ready)

```
User Browser
    │
    ├─► Static Frontend (CDN/S3)
    │   ├─ index.html
    │   ├─ register.html
    │   ├─ login.html
    │   └─ dashboard.html
    │
    └─► Backend API (Docker/Kubernetes)
        ├─ Express Server (Load Balanced)
        ├─ Environment: Production
        └─ Port: 5001
        
        ▼
        
Database (Aiven Cloud)
├─ MySQL: mysql-32bc787b-sudeekshamg71-d08a.j.aivencloud.com
├─ Port: 24115
├─ SSL: Required
├─ Replicas: Available
└─ Backups: Automatic
```

---

**This architecture is secure, scalable, and production-ready!** 🎉

