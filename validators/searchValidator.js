// validators/searchValidator.js

import { query } from 'express-validator';

import { createValidationError } from '../mappers/errorRegistry/validationErrors.js';

const REGEX = /^[\p{L}\d\s\-.,!?'"()&:/+]+$/u;

const MIN = 1;
const MAX = 80;

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const validate = (fieldName) => {
  const capitalizedFieldName = capitalize(fieldName);

  return [
    query(fieldName)
      .trim()
      .notEmpty()
      .withMessage(
        `Please enter ${fieldName === 'track' ? 'a' : 'an'} ${fieldName} name.`,
      )
      .isLength({ min: MIN, max: MAX })
      .withMessage(
        `${capitalizedFieldName} name must be between ${MIN} and ${MAX} characters.`,
      )
      .matches(REGEX)
      .withMessage(
        `${capitalizedFieldName} name can only contain letters, numbers, and basic punctuation.`,
      ),
  ];
};

/* ----------------------------------------------------------- */
/* ----------------- Artist Query Validator ----------------- */
/* ----------------------------------------------------------- */
export const artistQueryValidator = validate('artist');

/* ----------------------------------------------------------- */
/* ----------------- Album Query Validator ------------------ */
/* ----------------------------------------------------------- */
export const albumQueryValidator = validate('album');

/* ----------------------------------------------------------- */
/* ----------------- Track Query Validator ------------------ */
/* ----------------------------------------------------------- */
export const trackQueryValidator = validate('track');

/* ----------------------------------------------------------- */
/* ---------------- Autocomplete Validator ------------------ */
/* ----------------------------------------------------------- */
// Validates the request body for POST /artists/autocomplete
export const autocompleteQueryValidator = [
  query('query')
    .trim() // remove leading/trailing whitespace
    .notEmpty()
    .withMessage('Please enter a search query.')
    .isLength({ min: MIN, max: MAX })
    .withMessage(`Search query must be between ${MIN} and ${MAX} characters.`)
    .matches(REGEX)
    .withMessage(
      'Search query can only contain letters, numbers, and basic punctuation.',
    ),
];

/* ----------------------------------------------------------- */
/* ---------------- Redirect Validator ---------------------- */
/* ----------------------------------------------------------- */
// Validates query parameters for /redirect route
// Can handle artist, album, and track, plus an optional 'option' param
const validateOptionalQuery = (fieldName) => {
  const capitalizedFieldName = capitalize(fieldName);
  return query(fieldName)
    .optional()
    .trim()
    .isLength({ min: MIN, max: MAX })
    .withMessage(
      `${capitalizedFieldName} must be between ${MIN} and ${MAX} characters.`,
    )
    .matches(REGEX)
    .withMessage(
      `${capitalizedFieldName} can only contain letters, numbers, and basic punctuation.`,
    );
};

export const redirectQueryValidator = [
  validateOptionalQuery('artist'),
  validateOptionalQuery('album'),
  validateOptionalQuery('track'),

  // Custom validator to ensure at least one of artist, album, or track is present
  (req, res, next) => {
    if (!req.query.artist && !req.query.album && !req.query.track) {
      return next(createValidationError('missingRedirectFields'));
    }
    next();
  },

  query('option')
    .isIn(['allAlbums', 'topTracks', 'details'])
    .withMessage(
      "Invalid redirect option. Please choose 'All Albums', 'Top Tracks', or 'Details'.",
    ),
];
