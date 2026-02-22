// Authentication Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Register a new user
const register = async (req, res) => {
  try {
    const { uid, username, password, email, phone, role } = req.body;
    
    // Validation
    if (!username || !password || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields.' 
      });
    }
    
    // Check if role is Customer
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
    
    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const [result] = await connection.execute(
      'INSERT INTO KodUser (username, email, password, phone, role, balance) VALUES (?, ?, ?, ?, ?, 100000)',
      [username, email, hashedPassword, phone, role]
    );
    
    connection.release();
    
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

// Login user
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
    
    // Check if user exists
    const [users] = await connection.execute(
      'SELECT uid, username, password, role FROM KodUser WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password.' 
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password.' 
      });
    }
    
    // Generate JWT token
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
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
    await connection.execute(
      'INSERT INTO UserToken (token, uid, expiry) VALUES (?, ?, ?)',
      [token, user.uid, expiryTime]
    );
    
    connection.release();
    
    // Set token in cookie and send response
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
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

// Logout user
const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logout successful!'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed.' 
    });
  }
};

module.exports = {
  register,
  login,
  logout
};
