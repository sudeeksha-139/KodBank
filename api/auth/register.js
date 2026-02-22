import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

console.log('Environment check:', {
  DB_HOST: process.env.DB_HOST ? '✓' : '✗',
  DB_PORT: process.env.DB_PORT ? '✓' : '✗',
  DB_USER: process.env.DB_USER ? '✓' : '✗',
  DB_PASSWORD: process.env.DB_PASSWORD ? '✓' : '✗',
  DB_NAME: process.env.DB_NAME ? '✓' : '✗',
  JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗'
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  ssl: true
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password, username, phone } = req.body;

    console.log('Register attempt:', { email, username, phone });

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('Attempting database connection...');
    const connection = await pool.getConnection();
    console.log('Database connected successfully');

    // Check if user already exists
    const [existing] = await connection.execute(
      'SELECT uid FROM KodUser WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      await connection.end();
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Insert new user
    const [result] = await connection.execute(
      'INSERT INTO KodUser (username, email, password, phone, balance, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, phone || '', 100000, 'Customer']
    );

    await connection.end();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      uid: result.insertId
    });
  } catch (error) {
    console.error('Register error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
}
