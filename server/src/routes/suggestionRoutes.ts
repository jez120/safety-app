import { Router } from 'express';
import {
  createSuggestion,
  getSuggestions,
  getSuggestionAnalytics,
  getSuggestionById,
  updateSuggestionStatus,
  getMySuggestions,
  getCommentsForSuggestion,
  addCommentToSuggestion
} from '../controllers/suggestionController';
import { protect, isAdmin } from '../middleware/authMiddleware';
import upload from '../config/multerConfig';
import asyncHandler from '../utils/asyncHandler'; // Import the wrapper

const router = Router();

// Route to create a new suggestion
// POST /api/suggestions
router.post('/', upload.single('attachment'), asyncHandler(createSuggestion)); // Wrap controller

// Route to get all suggestions (Admin only)
// GET /api/suggestions
router.get('/', protect, isAdmin, asyncHandler(getSuggestions)); // Wrap controller

// Route to get suggestion analytics (Admin only)
// GET /api/suggestions/analytics
router.get('/analytics', protect, isAdmin, asyncHandler(getSuggestionAnalytics)); // Wrap controller

// Route for a user to get their own suggestions
// GET /api/suggestions/my
// IMPORTANT: Define specific routes like '/my' before parameterized routes like '/:id'
router.get('/my', protect, asyncHandler(getMySuggestions)); // Wrap controller

// Route to get a single suggestion by ID
// GET /api/suggestions/:id
// Protect this route - potentially allow submitter access later
router.get('/:id', protect, asyncHandler(getSuggestionById)); // Wrap controller

// Route to update suggestion status (Admin only)
// PUT /api/suggestions/:id/status
router.put('/:id/status', protect, isAdmin, asyncHandler(updateSuggestionStatus)); // Wrap controller

// --- Comment Routes ---

// GET comments for a specific suggestion
router.get('/:id/comments', protect, asyncHandler(getCommentsForSuggestion)); // Wrap controller

// POST a new comment to a specific suggestion
router.post('/:id/comments', protect, (req, res, next) => {
  console.log(`--- Reached POST /api/suggestions/${req.params.id}/comments route ---`); // DEBUG LOG
  next(); // Pass control to the next handler (addCommentToSuggestion)
}, addCommentToSuggestion);


export default router;
