import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';
// dotenv should be configured in the main server file (server.ts)
// import dotenv from 'dotenv';
// dotenv.config({ path: '../../.env' }); // REMOVE THIS LINE

const JWT_SECRET = process.env.JWT_SECRET; // Read from process.env loaded by server.ts

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1); // Exit if JWT secret is missing
}

// --- Registration ---
export const register = async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body; // Role is optional, defaults in DB

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  try {
    // Check if user already exists (by email or username)
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists with this email or username.' }); // 409 Conflict
    }

    // Hash the password
    const saltRounds = 10; // Standard practice
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user into the database
    const newUserQuery = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, username, email, role, created_at
    `;
    // Use provided role or default 'employee' if not provided
    const newUser = await pool.query(newUserQuery, [username, email, passwordHash, role || 'employee']);

    // Don't send password hash back
    res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });

  } catch (err) {
    console.error('Registration error:', err);
    if (err instanceof Error) {
      return res.status(500).json({ message: 'Failed to register user', error: err.message });
    }
    res.status(500).json({ message: 'An unexpected error occurred during registration' });
  }
};

// --- Login ---
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Find user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
    }

    const user = userResult.rows[0];

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Password doesn't match
    }

    // Passwords match, create JWT payload
    const payload = {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Sign the token
    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour (adjust as needed)
    );

    // Send token back to client (excluding password hash)
    res.json({
      message: 'Login successful',
      token: token,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    if (err instanceof Error) {
      return res.status(500).json({ message: 'Login failed', error: err.message });
    }
    res.status(500).json({ message: 'An unexpected error occurred during login' });
  }
};
