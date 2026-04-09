// validators/searchValidator.js or artistValidator.js

import { query, matchedData } from 'express-validator';

import { createValidationError } from '../mappers/errorRegistry/validationErrors.js';

const REGEX = /^[\p{L}\d\s\-.,!?'"()&:/+]+$/u;

const MIN = 2;
const MAX = 80;

const removeExtraSpaces = (value) => value.replace(/\s+/g, ' ');

export const artistQueryValidator = [
  query('artist')
    .trim()
    .customSanitizer(removeExtraSpaces)
    .notEmpty()
    .withMessage('Please enter a search query for artist.')
    .isLength({ min: MIN, max: MAX })
    .withMessage(
      `Artist search query must be between ${MIN} and ${MAX} characters.`,
    )
    .matches(REGEX)
    .withMessage(
      'Artist search query can only contain letters, numbers, and basic punctuation.',
    ),
];
