import { NextFunction, Request, Response } from 'express';
import z from 'zod';
import { AppError } from '../errors/app-error';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof z.ZodError) {
    res.status(400).json({
      message: 'Invalid request body',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ message: 'Internal server error' });
};
