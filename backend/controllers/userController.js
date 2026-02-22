// User Controller
const { pool } = require('../config/database');

// Get user balance
const getBalance = async (req, res) => {
  try {
    // req.user is populated by verifyToken middleware
    const userId = req.user.uid;
    const username = req.user.username;
    
    const connection = await pool.getConnection();
    
    // Fetch balance from database
    const [users] = await connection.execute(
      'SELECT balance FROM KodUser WHERE uid = ?',
      [userId]
    );
    
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }
    
    const balance = users[0].balance;
    
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

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const connection = await pool.getConnection();
    
    // Fetch user profile
    const [users] = await connection.execute(
      'SELECT uid, username, email, phone, role, balance, created_at FROM KodUser WHERE uid = ?',
      [userId]
    );
    
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }
    
    res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile. Please try again.' 
    });
  }
};

module.exports = {
  getBalance,
  getUserProfile
};
