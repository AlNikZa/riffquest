// middleware/validationHandler.js

import { validationResult } from 'express-validator';
import { AppError } from '../AppError.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array();

    return next(
      new AppError('Bad request. Validation failed.', 400, formattedErrors),
    );
  }
  next();
};
