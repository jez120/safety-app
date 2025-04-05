import { Request, Response, NextFunction, RequestHandler } from 'express';

// No need for a separate AsyncController type if we accept RequestHandler directly
// type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<any>;

// The asyncHandler wrapper - now accepts any RequestHandler
const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next); // Catch promise rejections and pass to next()
  };

export default asyncHandler;
