// routes/artist.js

import express from 'express';

import { artistQueryValidator } from '../validators/searchValidator.js';
import { validateId } from '../validators/commonValidators.js';

import { handleValidationErrors } from '../middleware/validationHandler.js';

import {
  artistSuggestionsController,
  artistSearchController,
  getArtistByIdController,
} from '../controllers/artistController.js';

const router = express.Router();

router.get(
  '/artists/suggestions',
  artistQueryValidator,
  handleValidationErrors,
  artistSuggestionsController,
);

router.get(
  '/artists/search',
  artistQueryValidator,
  handleValidationErrors,
  artistSearchController,
);

router.get(
  '/artists/:id',
  validateId,
  handleValidationErrors,
  getArtistByIdController,
);

export default router;
