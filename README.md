# 🏦 KODBANK - A Complete Full-Stack Banking Application

A beginner-friendly full-stack web application for banking operations with JWT authentication, built using Node.js/Express, HTML/CSS/JavaScript, and Aiven MySQL.

---

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Setup (Aiven MySQL)](#database-setup-aiven-mysql)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [User Flow](#user-flow)
- [Security Features](#security-features)

---

## 📁 Project Structure

```
kodnestPayment/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration and initialization
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── controllers/
│   │   ├── authController.js    # Registration and login logic
│   │   └── userController.js    # User balance and profile logic
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── user.js              # User routes
│   ├── .env                     # Environment variables (KEEP SECRET!)
│   ├── package.json             # Backend dependencies
│   └── server.js                # Main server file
│
├── frontend/
│   ├── css/
│   │   └── styles.css           # All styling and animations
│   ├── js/
│   │   ├── auth.js              # Registration and login logic
│   │   └── dashboard.js         # Dashboard and balance logic
│   ├── index.html               # Home/landing page
│   ├── register.html            # Registration page
│   ├── login.html               # Login page
│   └── dashboard.html           # User dashboard
│
└── README.md                     # This file
```

---

## ✨ Features

### 1. **User Registration**
- Users can create a new account
- Password encryption with bcryptjs
- Default balance of ₹1,00,000 (1 Lakh)
- Only "Customer" role allowed
- Form validation on frontend and backend

### 2. **User Login**
- Secure login with username and password
- JWT token generation (24-hour expiry)
- Token stored in both cookie and localStorage
- Password verified against encrypted database storage

### 3. **JWT Authentication**
- Tokens signed with secret key
- Automatic token expiry verification
- Invalid token detection
- Protected balance endpoint

### 4. **User Dashboard**
- Welcome message with username
- Check Balance button
- Secure logout functionality

### 5. **Balance Checking**
- Fetches real balance from database
- Requires valid JWT token
- Shows error if token expired
- Celebratory confetti animation on success
- Displays balance as "₹Amount"

### 6. **Security Features**
- Password encryption with bcryptjs (10 salt rounds)
- JWT-based authentication
- HTTP-only cookies
- CORS protection
- Token expiry handling
- Protected API endpoints

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2/Promise** - Database driver with async support
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation and verification
- **dotenv** - Environment variable management
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling and animations
- **Vanilla JavaScript** - Interactivity
- **Fetch API** - HTTP requests

### Database
- **Aiven MySQL** - Cloud MySQL database service

---

## 💾 Database Setup (Aiven MySQL)

### Step 1: Create Aiven Account
1. Go to [https://aiven.io](https://aiven.io)
2. Sign up for a free account
3. Verify your email

### Step 2: Create MySQL Database
1. Log in to Aiven console
2. Click "Create Service" → Select "MySQL"
3. Choose plan: **Free (Startup-4)** - fully free
4. Select region (closest to you)
5. Give it a name: `kodbank`
6. Click "Create Service"

### Step 3: Get Connection Details
Once service is created:
1. Go to your MySQL service
2. Click "Connection Information"
3. Copy these details:
   - **Host**: `hostname.a.aivencloud.com`
   - **Port**: `3306` (usually)
   - **Username**: `avnadmin` (default)
   - **Password**: [shown in connection details]
   - **Default Database**: `defaultdb`

### Step 4: Update .env File
Edit `backend/.env` with your Aiven credentials:

```env
DB_HOST=your-aiven-host.a.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your-actual-password
DB_NAME=defaultdb
DB_SSL=true

JWT_SECRET=your-super-secret-jwt-key-change-this!
PORT=5000
NODE_ENV=development
```

### Step 5: Enable SSL (Important!)
- Aiven requires SSL connections
- Set `DB_SSL=true` in .env (already configured)
- No additional setup needed - it's handled automatically

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** v14+ installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MySQL client** (optional, for manual testing)
- Aiven MySQL account with credentials

### Step 1: Clone or Download Project
```bash
cd kodnestPayment
```

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create and update .env file with your Aiven credentials
# Edit the .env file and add your MySQL connection details

# Your .env should look like:
# DB_HOST=xxxxx.a.aivencloud.com
# DB_PORT=3306
# DB_USER=avnadmin
# DB_PASSWORD=xxxxx
# DB_NAME=defaultdb
# DB_SSL=true
# JWT_SECRET=your-secret-key
# PORT=5000
# NODE_ENV=development

# (Optional) Install nodemon for development
npm install --save-dev nodemon
```

### Step 3: Test Database Connection
Before running the full app, test your database connection:

```bash
# From backend directory
node -e "require('dotenv').config(); const mysql = require('mysql2/promise'); 
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});
pool.getConnection().then(conn => { console.log('✓ Database connected!'); conn.release(); process.exit(0); }).catch(err => { console.log('✗ Connection failed:', err.message); process.exit(1); });"
```

---

## 🚀 Running the Application

### Start Backend Server (Terminal 1)
```bash
cd backend

# Option 1: Start with npm start
npm start

# Option 2: Use nodemon for auto-restart on changes
npm run dev

# You should see:
# ✓ Database tables initialized successfully
# ✓ Kodbank server running on http://localhost:5000
# ✓ Frontend: http://localhost:3000
```

### Serve Frontend (Terminal 2)
You can serve the frontend using any simple HTTP server:

**Option 1: Python (if installed)**
```bash
cd frontend
python -m http.server 3000
# Or for Python 2:
# python -m SimpleHTTPServer 3000
```

**Option 2: Node.js http-server**
```bash
# Install globally (one time)
npm install -g http-server

# Serve
cd frontend
http-server -p 3000
```

**Option 3: VS Code Live Server Extension**
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` in frontend folder
3. Select "Open with Live Server"
4. Update API_URL in frontend/js files to match your backend

### Access the Application
- **Homepage**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔌 API Endpoints

### Authentication Endpoints

#### 1. Register User
**POST** `/api/auth/register`

Request:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "Customer"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Registration successful! Please login.",
  "userId": 1
}
```

#### 2. Login User
**POST** `/api/auth/login`

Request:
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "john_doe"
}
```

#### 3. Logout User
**POST** `/api/auth/logout`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Logout successful!"
}
```

### User Endpoints

#### 4. Get User Balance
**GET** `/api/user/balance`

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Response (Success):
```json
{
  "success": true,
  "message": "Balance fetched successfully!",
  "username": "john_doe",
  "balance": 1000.00
}
```

Response (Token Expired):
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

#### 5. Get User Profile
**GET** `/api/user/profile`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "user": {
    "uid": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "Customer",
    "balance": 1000.00,
    "created_at": "2026-02-22T10:30:00.000Z"
  }
}
```

---

## 👥 User Flow

```
┌─────────────────┐
│   Homepage      │
│   index.html    │
└────────┬────────┘
         │
    ┌────┴─────┐
    ▼          ▼
┌────────┐  ┌────────┐
│Register│  │ Login  │
│.html   │  │.html   │
└───┬────┘  └───┬────┘
    │          │
    └────┬─────┘
         │
         ▼
    ┌─────────────────┐
    │ Backend Validation
    │ - Encrypt pass  │
    │ - Generate JWT  │
    │ - Store token   │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   Dashboard     │
    │  dashboard.html │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────┐
    │ Check Balance Button│
    └────────┬────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Verify JWT Token         │
    │ - Check signature        │
    │ - Check expiry          │
    │ - Extract username      │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Fetch Balance from DB    │
    │ Display with animation   │
    │ Show celebration confetti│
    └──────────────────────────┘
```

---

## 🔒 Security Features

### 1. Password Encryption
- Uses bcryptjs with 10 salt rounds
- Passwords never stored in plain text
- Example: `password123` → hashed string

### 2. JWT Authentication
- 24-hour token expiry
- Tokens verified on every protected request
- Invalid/expired tokens rejected with error message

### 3. Token Storage
- Frontend: Stored in localStorage (for persistence)
- Backend: Also stored in cookies (for CORS)
- Sent as Authorization header for protected endpoints

### 4. Database Security
- Connection credentials stored in `.env` (not in code)
- SSL enabled for Aiven MySQL connection
- Foreign key constraints enforce referential integrity

### 5. API Protection
- CORS configured to only accept frontend requests
- HTTP-only cookies prevent XSS attacks
- Protected endpoints require valid JWT token

### 6. Error Handling
- Generic error messages (don't reveal user existence)
- Proper HTTP status codes
- No sensitive data in responses

---

## 📝 Database Schema

### KodUser Table
```sql
CREATE TABLE KodUser (
  uid INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL (bcrypt hash),
  balance DECIMAL(10, 2) DEFAULT 1000,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'Customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### UserToken Table
```sql
CREATE TABLE UserToken (
  tid INT PRIMARY KEY AUTO_INCREMENT,
  token LONGTEXT NOT NULL (JWT token),
  uid INT NOT NULL (Foreign Key),
  expiry DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE
);
```

---

## 🧪 Testing the Application

### Test User Registration
1. Go to [http://localhost:3000/register.html](http://localhost:3000/register.html)
2. Fill in form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
   - Phone: `9876543210`
3. Click "Register"
4. Should see success message

### Test User Login
1. Go to [http://localhost:3000/login.html](http://localhost:3000/login.html)
2. Enter registered credentials
3. Click "Login"
4. Should be redirected to dashboard

### Test Balance Check
1. On dashboard, click "Check Balance" button
2. Should show balance: ₹1,00,000.00
3. Should see confetti animation
4. Success message: "✓ Your balance has been verified securely"

### Test Token Expiry
1. Wait for token to expire (24 hours) or manually test:
2. In browser console: `localStorage.setItem('token', 'invalid-token')`
3. Click "Check Balance"
4. Should see error: "Invalid token. Please login again."

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:**
- Check if Aiven MySQL service is running
- Verify `.env` credentials match Aiven details
- Ensure SSL is enabled (DB_SSL=true)
- Check firewall/network allows MySQL port 3306

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Ensure frontend is running on `http://localhost:3000`
- Backend is on `http://localhost:5000`
- Check CORS configuration in server.js

### Token Verification Failed
```
Error: JsonWebTokenError: invalid signature
```
**Solution:**
- JWT_SECRET in .env is used to sign tokens
- If changed, all existing tokens become invalid
- Use consistent JWT_SECRET across server restarts

### Module Not Found
```
Error: Cannot find module 'mysql2'
```
**Solution:**
```bash
cd backend
npm install
```

---

## 📚 Code Comments

All code includes detailed comments explaining:
- What each function does
- Parameters and return values
- Database queries
- Error handling
- Security considerations

---

## 🎨 UI Features

- **Beautiful gradient backgrounds**
- **Smooth animations and transitions**
- **Loading spinner during API calls**
- **Celebratory confetti on balance check**
- **Responsive design (mobile-friendly)**
- **Form validation with error messages**
- **Clean, professional UI**

---

## 📄 Environment Variables Explained

```env
# Database Connection
DB_HOST=hostname.a.aivencloud.com    # Aiven MySQL host
DB_PORT=3306                         # MySQL port
DB_USER=avnadmin                     # Aiven default user
DB_PASSWORD=xxxxx                    # Your Aiven password
DB_NAME=defaultdb                    # Database name
DB_SSL=true                          # Enable SSL (required for Aiven)

# JWT Configuration
JWT_SECRET=your-secret-key           # Change this! Sign tokens with this
PORT=5000                            # Server port
NODE_ENV=development                 # Environment (development/production)
```

---

## 🎓 Learning Resources

This project teaches:
- RESTful API design
- JWT authentication
- Password hashing with bcryptjs
- Async/await in Node.js
- SQL database design
- Frontend-backend communication
- Form validation
- Error handling
- Security best practices

---

## 📞 Support

For issues or questions:
1. Check the **Troubleshooting** section
2. Verify all credentials in `.env`
3. Check backend console for error messages
4. Check browser console for frontend errors
5. Verify database connection is working

---

## 📜 License

This project is created for educational purposes.

---

## ✅ Checklist for Setup

- [ ] Create Aiven MySQL account
- [ ] Create MySQL database
- [ ] Get connection credentials
- [ ] Update `backend/.env` file
- [ ] Run `npm install` in backend
- [ ] Test database connection
- [ ] Start backend server (`npm start`)
- [ ] Start frontend server (http-server on port 3000)
- [ ] Test registration
- [ ] Test login
- [ ] Test balance checking
- [ ] Test logout

---

**Happy Banking! 🏦💳**

Made with ❤️ for learning full-stack web development.
