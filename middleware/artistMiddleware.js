// middleware/artistMiddleware.js

import { getArtistId } from '../services/artistService.js';
import { getTokenOrThrowNewAppError } from '../services/globalTokenService.js';
import { AppError } from '../middleware/errorHandler.js';

export const getTokenAndArtistIdMiddleware = async (req, res, next) => {
  try {
    const token = getTokenOrThrowNewAppError();
    const artistName = req.query.artist;

    if (!artistName) {
      return next(new AppError('Please provide an artist name.', 400));
    }

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
