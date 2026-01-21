// middleware/artistMiddleware.js

import { getArtistId } from '../services/artistService.js';
import { getTokenOrThrowNewAppError } from '../services/globalTokenService.js';
import { AppError } from '../AppError.js';

export const getTokenAndArtistIdMiddleware = async (req, res, next) => {
  try {
    const rawArtist = req.query.artist;

    if (!rawArtist) {
      return next(new AppError('Please provide an artist name.', 400));
    }

    if (typeof rawArtist !== 'string') {
      return next(
        new AppError(
          'Invalid artist format. Only a single search term is allowed.',
          400,
        ),
      );
    }

    const artistName = rawArtist.trim();
    if (artistName.length === 0) {
      return next(new AppError('Artist name cannot be empty.', 400));
    }

    const token = await getTokenOrThrowNewAppError();

    const artistId = await getArtistId(artistName, token);
    if (!artistId) {
      return next(new AppError(`Artist "${artistName}" not found.`, 404));
    }

    req.artistId = artistId;
    req.token = token;
    next();
  } catch (err) {
    next(err); // Forward error to global error handler
  }
};
