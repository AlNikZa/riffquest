// middleware/validationHandler.js

import { validationResult } from 'express-validator';

import { createValidationError } from '../mappers/errorRegistry/validationErrors.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param || err.field,
      message: err.msg,
      value: err.value,
    }));
    return next(
      createValidationError('validationFailed', {
        validationErrors: formattedErrors,
      }),
    );
  }

  next();
};

/**
 * CONSIDER: If manual error mapping feels redundant, simplify by:
 * 1. Removing specific keys (artistNameRequired, etc.) from this registry.
 * 2. Defining messages directly in the route validators via .withMessage().
 * 3. Making 'validationFailed' dynamic by picking the first error message:
 * message: validationErrors[0]?.message || 'Input validation failed.'
 */
