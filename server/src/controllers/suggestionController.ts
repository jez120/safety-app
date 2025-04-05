import { Request, Response, NextFunction, RequestHandler } from 'express'; // Import RequestHandler
import pool from '../db';
import { MulterError } from 'multer';

// Controller function to create a new suggestion (handles file upload)
export const createSuggestion = async (req: Request, res: Response, next: NextFunction) => { // Add next
  // Data comes from req.body (text fields) and req.file (uploaded file)
  const { user_id, title, description, department } = req.body;

  // Access uploaded file info (if exists) via req.file added by multer
  const file = req.file;
  const filePath = file ? file.path : null; // Get file path if upload occurred

  // Basic validation (user_id might come from auth later)
  // Convert user_id from string (form-data) to number if necessary
  const userIdNum = parseInt(user_id, 10);
  if (isNaN(userIdNum) || !title || !description) {
    // If file was uploaded despite validation error, attempt to delete it
    if (file) {
      // fs.unlink(filePath, (unlinkErr) => { // Requires importing 'fs'
      //   if (unlinkErr) console.error("Error deleting uploaded file after validation fail:", unlinkErr);
      // });
      console.warn("Uploaded file exists but validation failed. Consider implementing file cleanup.");
    }
    res.status(400).json({ message: 'Missing required fields: user_id (must be number), title, description' });
    return; // Exit after sending response
  }

  try {
    const newSuggestion = await pool.query(
      'INSERT INTO suggestions (user_id, title, description, department, file_attachment_path) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userIdNum, title, description, department, filePath] // Include filePath
    );

    res.status(201).json(newSuggestion.rows[0]);
  } catch (err) {
    // If DB insert fails, attempt to delete the uploaded file
    if (file && filePath) {
      console.warn("DB insert failed after file upload. Consider implementing file cleanup for path:", filePath);
      // fs.unlink(filePath, (unlinkErr) => { ... });
    }
    console.error('Error creating suggestion:', err);
    // Handle specific errors (like Multer errors) if needed
    if (err instanceof MulterError) {
      // A Multer error occurred when uploading.
      res.status(400).json({ message: `File upload error: ${err.message}` });
      return; // Exit after sending response
    } else if (err instanceof Error) {
      // Check for specific DB errors if needed, e.g., foreign key violation
      if ((err as any).code === '23503') {
        res.status(400).json({ message: `User with ID ${userIdNum} does not exist.` });
        return; // Exit after sending response
      }
      res.status(500).json({ message: 'Failed to create suggestion', error: err.message });
      return; // Exit after sending response
    }
    res.status(500).json({ message: 'An unexpected error occurred' });
    return; // Exit after sending response
  }
};

// Controller function to get comments for a specific suggestion
export const getCommentsForSuggestion: RequestHandler = async (req, res, next) => {
  const { id } = req.params; // Suggestion ID

  if (!id || isNaN(parseInt(id, 10))) {
    res.status(400).json({ message: 'Invalid suggestion ID provided.' });
    return;
  }

  try {
    const query = `
      SELECT c.comment_id, c.comment_text, c.created_at, u.username AS author_username
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.suggestion_id = $1
      ORDER BY c.created_at ASC; -- Show oldest comments first
    `;
    const commentsResult = await pool.query(query, [parseInt(id, 10)]);
    res.json(commentsResult.rows);
  } catch (err) {
    console.error(`Error fetching comments for suggestion ${id}:`, err);
    if (err instanceof Error) {
      res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
      return;
    }
    res.status(500).json({ message: 'An unexpected error occurred' });
    return;
  }
};

// Controller function to add a comment to a suggestion
export const addCommentToSuggestion: RequestHandler = async (req, res, next) => {
  const { id } = req.params; // Suggestion ID
  const { comment_text } = req.body;
  const user = (req as any).user; // Get user object
  const userId = user?.userId; // Get user ID from authenticated user

  console.log(`--- Adding Comment to Suggestion ${id} ---`); // DEBUG
  console.log(`User ID: ${userId}, Comment Text: ${comment_text}`); // DEBUG

  if (!id || isNaN(parseInt(id, 10))) {
    console.error(`AddComment Error: Invalid suggestion ID: ${id}`); // DEBUG
    res.status(400).json({ message: 'Invalid suggestion ID provided.' });
    return;
  }
  if (!userId) {
    console.error(`AddComment Error: User ID not found on request.`); // DEBUG
    res.status(401).json({ message: 'Not authorized, user ID not found.' });
    return;
  }
  if (!comment_text || typeof comment_text !== 'string' || comment_text.trim() === '') {
    console.error(`AddComment Error: Invalid comment text: ${comment_text}`); // DEBUG
    res.status(400).json({ message: 'Comment text cannot be empty.' });
    return;
  }

  try {
    console.log(`AddComment Try: Checking if suggestion ${id} exists.`); // DEBUG
    // Verify suggestion exists (optional, but good practice)
    const suggestionExists = await pool.query('SELECT 1 FROM suggestions WHERE suggestion_id = $1', [parseInt(id, 10)]);
    if (suggestionExists.rows.length === 0) {
      console.error(`AddComment Error: Suggestion ${id} not found.`); // DEBUG
      res.status(404).json({ message: 'Suggestion not found, cannot add comment.' });
      return;
    }

    console.log(`AddComment Try: Inserting comment for user ${userId} on suggestion ${id}.`); // DEBUG
    const insertQuery = `
      INSERT INTO comments (suggestion_id, user_id, comment_text)
      VALUES ($1, $2, $3)
      RETURNING comment_id, suggestion_id, user_id, comment_text, created_at;
    `;
    const newCommentResult = await pool.query(insertQuery, [parseInt(id, 10), userId, comment_text]);
    const newCommentData = newCommentResult.rows[0];
    console.log(`AddComment Try: Inserted comment ID: ${newCommentData.comment_id}`); // DEBUG

    // Construct the response object directly
    const responseData = {
      comment_id: newCommentData.comment_id,
      comment_text: newCommentData.comment_text,
      created_at: newCommentData.created_at,
      author_username: user?.username || 'Unknown' // Get username from req.user
    };
    console.log(`AddComment Try: Constructed response:`, responseData); // DEBUG

    res.status(201).json(responseData);
    return; // Exit after sending response

  } catch (err) {
    console.error(`AddComment Catch: Error adding comment to suggestion ${id}:`, err); // Enhanced DEBUG
    if (err instanceof Error) {
      // Check for foreign key violation (e.g., suggestion_id doesn't exist)
      if ((err as any).code === '23503') {
        res.status(404).json({ message: 'Suggestion not found or user invalid.' });
        return;
      }
      res.status(500).json({ message: 'Failed to add comment', error: err.message });
      return;
    }
    res.status(500).json({ message: 'An unexpected error occurred' });
    return;
  }
};

// Controller function to get suggestions for the logged-in user
export const getMySuggestions: RequestHandler = async (req, res, next) => { // Explicit type
  // Use type assertion to access user property attached by middleware
  const user = (req as any).user;

  console.log('--- Reached getMySuggestions ---'); // DEBUG LOG 1
  console.log('req.user:', JSON.stringify(user, null, 2)); // DEBUG LOG 2 - Log the user object

  // Get user ID from the asserted user object
  const userId = user?.userId;

  if (!userId) {
    console.error('getMySuggestions Error: userId not found on req.user'); // DEBUG LOG 3
    // This should technically not happen if 'protect' middleware is used correctly
    res.status(401).json({ message: 'Not authorized, user ID not found.' });
    return; // Exit after sending response
  }

  try {
    const query = `
      SELECT
        suggestion_id, title, description, department, status, created_at, updated_at, file_attachment_path
      FROM suggestions
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const mySuggestions = await pool.query(query, [userId]);

    res.json(mySuggestions.rows);

  } catch (err) {
    console.error(`Error fetching suggestions for user ${userId}:`, err);
    if (err instanceof Error) {
      res.status(500).json({ message: 'Failed to fetch your suggestions', error: err.message });
      return; // Exit after sending response
    }
    console.error('getMySuggestions Error: Unexpected error type.'); // DEBUG LOG 4
    res.status(500).json({ message: 'An unexpected error occurred' });
    return; // Exit after sending response
  }
};

// Controller function to get all suggestions (Admin only)
export const getSuggestions = async (req: Request, res: Response, next: NextFunction) => { // Add next
  try {
    // Join with users table to get the username
    const query = `
      SELECT
        s.suggestion_id,
        s.title,
        s.description,
        s.department,
        s.status,
        s.created_at,
        s.updated_at,
        u.username AS submitted_by_username,
        s.user_id
      FROM suggestions s
      JOIN users u ON s.user_id = u.user_id
      ORDER BY s.created_at DESC; -- Order by most recent first
    `;
    const allSuggestions = await pool.query(query);

    res.json(allSuggestions.rows);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    if (err instanceof Error) {
      res.status(500).json({ message: 'Failed to fetch suggestions', error: err.message });
      return; // Exit after sending response
    }
    res.status(500).json({ message: 'An unexpected error occurred' });
    return; // Exit after sending response
  }
};

// Controller function to get suggestion analytics (Admin only)
export const getSuggestionAnalytics = async (req: Request, res: Response, next: NextFunction) => { // Add next
  try {
    // Query 1: Count suggestions by status
    const statusCountsQuery = `
      SELECT status, COUNT(*) as count
      FROM suggestions
      GROUP BY status;
    `;
    const statusCountsResult = await pool.query(statusCountsQuery);

    // Query 2: Count suggestions by department
    const departmentCountsQuery = `
      SELECT COALESCE(department, 'Unassigned') as department, COUNT(*) as count
      FROM suggestions
      GROUP BY COALESCE(department, 'Unassigned');
    `;
    const departmentCountsResult = await pool.query(departmentCountsQuery);

    // Query 3: Count suggestions over time (e.g., last 30 days by day)
    const submissionsTrendQuery = `
      SELECT DATE(created_at)::date as date, COUNT(*) as count
      FROM suggestions
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)::date
      ORDER BY date ASC;
    `;
    const submissionsTrendResult = await pool.query(submissionsTrendQuery);

    const analyticsData = {
      statusCounts: statusCountsResult.rows,
      departmentCounts: departmentCountsResult.rows,
      submissionsTrend: submissionsTrendResult.rows,
    };

    res.json(analyticsData);

  } catch (err) {
    console.error('Error fetching suggestion analytics:', err);
    if (err instanceof Error) {
      res.status(500).json({ message: 'Failed to fetch suggestion analytics', error: err.message });
      return; // Exit after sending response
    }
    res.status(500).json({ message: 'An unexpected error occurred' });
    return; // Exit after sending response
  }
};

// Controller function to get a single suggestion by ID
export const getSuggestionById = async (req: Request, res: Response, next: NextFunction) => { // Add next
  const { id } = req.params;

  if (!id || isNaN(parseInt(id, 10))) {
    res.status(400).json({ message: 'Invalid suggestion ID provided.' });
    return; // Exit after sending response
  }

  try {
    const query = `
      SELECT
        s.suggestion_id, s.title, s.description, s.department, s.status,
        s.created_at, s.updated_at, s.user_id,
        u.username AS submitted_by_username, u.email AS submitted_by_email
      FROM suggestions s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.suggestion_id = $1;
    `;
    const suggestionResult = await pool.query(query, [parseInt(id, 10)]);

    if (suggestionResult.rows.length === 0) {
      res.status(404).json({ message: 'Suggestion not found.' });
      return; // Exit after sending response
    }

    res.json(suggestionResult.rows[0]);

  } catch (err) {
    console.error(`Error fetching suggestion ${id}:`, err);
    if (err instanceof Error) {
      res.status(500).json({ message: 'Failed to fetch suggestion', error: err.message });
      return; // Exit after sending response
    }
    res.status(500).json({ message: 'An unexpected error occurred' });
    return; // Exit after sending response
  }
};

// Controller function to update suggestion status (Admin only)
export const updateSuggestionStatus = async (req: Request, res: Response, next: NextFunction) => { // Add next
  const { id } = req.params;
  const { status } = req.body;

  if (!id || isNaN(parseInt(id, 10))) {
    res.status(400).json({ message: 'Invalid suggestion ID provided.' });
    return; // Exit after sending response
  }

  if (!status || typeof status !== 'string') {
    res.status(400).json({ message: 'New status is required in the request body.' });
    return; // Exit after sending response
  }

  const allowedStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'implemented'];
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ message: `Invalid status value. Allowed values are: ${allowedStatuses.join(', ')}` });
    return; // Exit after sending response
  }

  try {
    const updateQuery = `
      UPDATE suggestions
      SET status = $1
      WHERE suggestion_id = $2
      RETURNING *;
    `;
    const updatedSuggestion = await pool.query(updateQuery, [status, parseInt(id, 10)]);

    if (updatedSuggestion.rows.length === 0) {
      res.status(404).json({ message: 'Suggestion not found, cannot update status.' });
      return; // Exit after sending response
    }

    // TODO: Add notification logic here later

    res.json({ message: 'Suggestion status updated successfully', suggestion: updatedSuggestion.rows[0] });

  } catch (err) {
    console.error(`Error updating status for suggestion ${id}:`, err);
    if (err instanceof Error) {
      res.status(500).json({ message: 'Failed to update suggestion status', error: err.message });
      return; // Exit after sending response
    }
    res.status(500).json({ message: 'An unexpected error occurred' });
    return; // Exit after sending response
  }
};
