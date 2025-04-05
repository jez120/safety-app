import dotenv from 'dotenv';
dotenv.config(); // Load environment variables FIRST

import express, { Express, Request, Response, NextFunction } from 'express'; // Import NextFunction
import cors from 'cors';
import pool from './db';
import suggestionRoutes from './routes/suggestionRoutes'; // Correct default import
import authRoutes from './routes/authRoutes';

const app: Express = express();
const port = process.env.PORT || 5001; // Use 5001 to avoid conflict with frontend default 5173

app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Middleware to parse JSON bodies

app.get('/', (req: Request, res: Response) => {
  res.send('Safety App Backend is Running!');
});

// Placeholder for future API routes
// API routes
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/auth', authRoutes); // Use the auth routes

// Test DB connection on startup (optional but good practice)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows[0].now);
  }
});

// --- Generic Error Handler Middleware ---
// This MUST be the LAST middleware added
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("--- UNHANDLED ERROR ---");
  console.error("Error Name:", err.name);
  console.error("Error Message:", err.message);
  console.error("Error Stack:", err.stack);
  // Avoid sending stack trace in production
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : { name: err.name, message: err.message }
  });
});


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app; // Export for potential testing
