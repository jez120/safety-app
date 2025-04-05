import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

// Define allowed mime types
const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    // Reject file - pass an error message
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'));
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the 'uploads' directory relative to server root
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer instance configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
});

export default upload;
