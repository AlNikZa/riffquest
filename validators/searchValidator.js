import { query, body } from 'express-validator';
import { AppError } from '../middleware/errorHandler.js';

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
      .withMessage(`${capitalizedFieldName} is required.`)
      .isLength({ min: MIN, max: MAX })
      .withMessage(
        `${capitalizedFieldName} must be ${MIN}–${MAX} characters long.`
      )
      .matches(REGEX)
      .withMessage(`${capitalizedFieldName} contains invalid characters.`),
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
export const autocompleteBodyValidator = [
  body('query')
    .trim() // remove leading/trailing whitespace
    .notEmpty()
    .withMessage('Search query is required.')
    .isLength({ min: MIN, max: MAX })
    .withMessage(`Search query must be ${MIN}–${MAX} characters long.`)
    .matches(REGEX)
    .withMessage('Search query contains invalid characters.'),
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
      `${capitalizedFieldName} must be ${MIN}–${MAX} characters long.`
    )
    .matches(REGEX)
    .withMessage(`${capitalizedFieldName} contains invalid characters.`);
};

export const redirectQueryValidator = [
  validateOptionalQuery('artist'),
  validateOptionalQuery('album'),
  validateOptionalQuery('track'),

  // Custom validator to ensure at least one of artist, album, or track is present
  (req, res, next) => {
    if (!req.query.artist && !req.query.album && !req.query.track) {
      return next(
        new AppError(
          'At least one of artist, album or track must be provided.',
          400
        )
      );
    }
    next();
  },

  query('option')
    .isIn(['allAlbums', 'topTracks', 'details'])
    .withMessage('Invalid redirect option.'),
];
