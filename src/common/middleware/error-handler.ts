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
      code: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (
    err instanceof SyntaxError &&
    'statusCode' in err &&
    err.statusCode === 400 &&
    'body' in err
  ) {
    res
      .status(err.statusCode)
      .json({ code: 'INVALID_JSON', message: 'Invalid JSON in request body' });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ code: err.code, message: err.message });
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
};
