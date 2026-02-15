// middleware/artistMiddleware.js

import { getArtistId } from '../services/artistService.js';
import { getTokenOrThrowNewAppError } from '../services/globalTokenService.js';
import { AppError } from '../AppError.js';
import { catchAsync } from './errorHandler.js';

export const getTokenAndArtistIdMiddleware = catchAsync(
  async (req, res, next) => {
    const rawArtist = req.query.artist;

    if (!rawArtist) {
      throw new AppError('Please provide an artist name.', 400);
    }

    if (typeof rawArtist !== 'string') {
      throw new AppError(
        'Invalid artist format. Only a single search term is allowed.',
        400,
      );
    }

    const artistName = rawArtist.trim();
    if (artistName.length === 0) {
      throw new AppError('Artist name cannot be empty.', 400);
    }

    const token = await getTokenOrThrowNewAppError();

    const artistId = await getArtistId(artistName, token);
    if (!artistId) {
      throw new AppError(`Artist "${artistName}" not found.`, 404);
    }

    req.artistId = artistId;
    req.token = token;
    next();
  },
);
