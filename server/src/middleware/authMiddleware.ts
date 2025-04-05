import { Request, Response, NextFunction, RequestHandler } from 'express'; // Import RequestHandler
import jwt from 'jsonwebtoken';

// JWT secret loaded from environment
const JWT_SECRET = process.env.JWT_SECRET;

// Interface for the decoded token payload
interface DecodedToken extends jwt.JwtPayload {
  userId: number;
  email: string;
  role: string;
  username?: string;
  id?: number; // Include id as potential fallback from some JWT libraries
}

// Interface for Express Request extension
// Using type assertion instead of global declaration to avoid potential conflicts
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         userId: number;
//         email: string;
//         role: string;
//       };
//     }
//   }
// }

// Middleware to protect routes
export const protect: RequestHandler = (req, res, next) => { // Explicitly type as RequestHandler
  let token;

  // Check if Authorization header exists
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
        return; // Exit
      }

      if (!JWT_SECRET) {
        console.error("JWT_SECRET is missing in authMiddleware");
        res.status(500).json({ message: 'Server configuration error' });
        return; // Exit
      }

      // Verify and decode the token
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      console.log('Decoded token:', decoded); // Keep for debugging if needed

      // Attach user payload using type assertion
      (req as any).user = {
        userId: decoded.userId || decoded.id, // Fallback to .id if needed
        email: decoded.email,
        role: decoded.role
      };

      next(); // Proceed if token is valid
    } catch (error) {
      console.error('Token verification failed:', error);

      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Not authorized, token expired' });
        return; // Exit
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: 'Not authorized, token invalid' });
        return; // Exit
      }

      res.status(401).json({ message: 'Not authorized, token verification failed' });
      return; // Exit
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
    return; // Exit
  }
};

// Middleware to check for admin role
export const isAdmin: RequestHandler = (req, res, next) => { // Explicitly type as RequestHandler
  // Use type assertion to access user property
  const user = (req as any).user;

  if (user && user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403).json({ message: 'Not authorized, admin role required' });
    // No return needed here as sending response ends middleware execution
  }
};
