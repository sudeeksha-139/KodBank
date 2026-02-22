// Database Configuration
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Initialize the database (create tables if they don't exist)
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create KodUser table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS KodUser (
        uid INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 100000,
        phone VARCHAR(20),
        role VARCHAR(20) NOT NULL DEFAULT 'Customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (uid)
      )
    `);
    
    // Create UserToken table
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
