// validators/commonValidators.js

import { param } from 'express-validator';

export const validateId = [
  param('id')
    .trim()
    .isUUID()
    .withMessage(
      'The item you are looking for could not be identified. Please try searching again.',
    ),
];
