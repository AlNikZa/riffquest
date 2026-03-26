// middleware/artistMiddleware.js

import { getArtistId } from '../services/artistService.js';
import { getOrRefreshSpotifyToken } from '../services/globalTokenService.js';

import { createValidationError } from '../mappers/errorRegistry/validationErrors.js';
import { createArtistError } from '../mappers/errorRegistry/artistErrors.js';

import { catchAsync } from '../utils/catchAsync.js';

export const getTokenAndArtistIdMiddleware = catchAsync(
  async (req, res, next) => {
    const rawArtist = req.query.artist;

    if (!rawArtist) {
      throw createValidationError('artistNameRequired');
      // also used in ../controllers/artistController.js
      //consider remove one
    }

    if (typeof rawArtist !== 'string') {
      throw createValidationError('invalidArtistFormat');
    }

    const artistName = rawArtist.trim();
    if (artistName.length === 0) {
      throw createValidationError('artistNameEmpty');
    }

    const token = await getOrRefreshSpotifyToken();

    const artistId = await getArtistId(artistName, token);
    if (!artistId) {
      throw createArtistError('noArtistIdFound', { artistName });
    }

    req.artistId = artistId;
    req.token = token;
    next();
  },
);
