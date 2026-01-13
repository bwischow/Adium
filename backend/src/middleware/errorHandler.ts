import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  }

  console.error('Unexpected error:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.nodeEnv === 'development' && {
      error: err.message,
      stack: err.stack
    }),
  });
};
