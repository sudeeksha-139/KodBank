// Main Server File
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());

// Serve static files from frontend folder
app.use(express.static('../frontend'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Basic route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Kodbank API',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found.' 
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`✓ Kodbank server running on http://localhost:${PORT}`);
      console.log(`✓ Frontend: http://localhost:3000`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
