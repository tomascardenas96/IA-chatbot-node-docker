import { AppError } from './app-error';
import { ErrorCode } from './error-code';

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = 'EMAIL_ALREADY_EXISTS') {
    super(message, 409, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCode = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code: ErrorCode = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, code: ErrorCode = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, code: ErrorCode = 'FORBIDDEN') {
    super(message, 403, code);
  }
}
