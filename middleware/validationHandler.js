// /middleware/validationHandler.js

import { validationResult } from 'express-validator';
import { AppError } from '../AppError.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array({ onlyFirstError: true })[0];
    const message =
      typeof firstError?.msg === 'string'
        ? firstError?.msg
        : 'Validation failed';
    return next(new AppError(message, 400));
  }
  next();
};
