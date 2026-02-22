// middleware/artistMiddleware.js

import { getArtistId } from '../services/artistService.js';
import { getTokenOrThrowNewAppError } from '../services/globalTokenService.js';
import { AppError } from '../AppError.js';
import { catchAsync } from './errorHandler.js';

export const getTokenAndArtistIdMiddleware = catchAsync(
  async (req, res, next) => {
    const rawArtist = req.query.artist;

    if (!rawArtist) {
      throw new AppError(
        'Bad request: Please enter an artist name to start the search.',
        400,
      );
    }

    if (typeof rawArtist !== 'string') {
      throw new AppError(
        'Bad request. Please provide a single artist name as text.',
        400,
      );
    }

    const artistName = rawArtist.trim();
    if (artistName.length === 0) {
      throw new AppError('Bad request. Artist name cannot be empty.', 400);
    }

    const token = await getTokenOrThrowNewAppError();

    const artistId = await getArtistId(artistName, token);
    if (!artistId) {
      throw new AppError(
        `Sorry, we couldn't find an artist named "${artistName}".`,
        404,
      );
    }

    req.artistId = artistId;
    req.token = token;
    next();
  },
);
