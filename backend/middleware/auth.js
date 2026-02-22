// Authentication Middleware
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided. Please login first.' 
      });
    }
    
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
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
