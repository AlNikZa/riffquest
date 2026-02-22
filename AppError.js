// AppError.js

// appError class to create operational errors
export class AppError extends Error {
  constructor(
    message = 'An unexpected error occurred',
    statusCode = 500,
    errors = null,
  ) {
    super(message);

    this.statusCode = statusCode;
    if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599)
      this.statusCode = 500;

    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errors = Array.isArray(errors) ? errors : null;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
