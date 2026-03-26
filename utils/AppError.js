// utils/AppError.js

import { isPlainObject } from './plainObjectUtils.js';
import { parseCode } from './httpUtils.js';

const buildAppErrorObject = (input) => {
  if (!isPlainObject(input)) input = {};

  const statusCode = parseCode(input.statusCode);

  return {
    timestamp: new Date().toISOString(),

    message: input.message || 'Something went wrong.',
    errorCode: input.errorCode || 'INTERNAL_ERROR',
    scope: input.scope || 'UNKNOWN_SCOPE',
    isOperational: input.isOperational ?? true,

    statusCode,
    status: String(statusCode).startsWith('4') ? 'fail' : 'error',

    validationErrors: Array.isArray(input.validationErrors)
      ? input.validationErrors
      : [],

    devMessage: input.devMessage || null,

    metadata: input.metadata || {},

    cause: input.cause || {},
  };
};

// appError class to create operational errors
export class AppError extends Error {
  constructor(input = {}) {
    const options = buildAppErrorObject(input);

    super(options.message, { cause: options.cause });

    this.name = this.constructor.name;

    this.timestamp = options.timestamp;
    this.errorCode = options.errorCode;
    this.scope = options.scope;
    this.isOperational = options.isOperational;
    this.statusCode = options.statusCode;
    this.status = options.status;
    this.validationErrors = options.validationErrors;
    this.devMessage = options.devMessage;
    this.metadata = options.metadata;

    Error.captureStackTrace(this, this.constructor);
  }
}
