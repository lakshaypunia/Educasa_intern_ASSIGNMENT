import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${req.method} ${req.path} —`, err.message);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
