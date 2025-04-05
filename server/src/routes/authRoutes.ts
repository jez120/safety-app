import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { RequestHandler } from 'express'; // Import RequestHandler type

const router = Router();

// Route for user registration
// POST /api/auth/register
router.post('/register', register as RequestHandler);

// Route for user login
// POST /api/auth/login
router.post('/login', login as RequestHandler);

export default router;
