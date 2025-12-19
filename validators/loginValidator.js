// validators/loginValidator.js

import { query } from 'express-validator';

export const loginCallbackValidator = [
  query('code')
    .optional()
    .isString()
    .withMessage('Authorization code must be a string')
    .trim(),
  query('state')
    .exists()
    .withMessage('State parameter is missing')
    .isString()
    .withMessage('State must be a string')
    .trim(),
  query('error')
    .optional()
    .isString()
    .withMessage('Error parameter must be a string')
    .trim(),
];
