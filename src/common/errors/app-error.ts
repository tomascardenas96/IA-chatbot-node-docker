export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Restaura la cadena de prototipos (necesario al extender Error en TS)
    Object.setPrototypeOf(this, new.target.prototype);

    // Captura el stack trace sin incluir el constructor
    Error.captureStackTrace(this, this.constructor);
  }
}
