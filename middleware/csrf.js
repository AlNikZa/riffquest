// middleware/csrf.js

import crypto from 'crypto';

import { AppError } from '../AppError.js';

export const createCsrfToken = (req, res, next) => {
  if (req.method !== 'GET') return next();
  if (!req.session) {
    return next(
      new AppError(
        'Security initialization failed. Please refresh the page.',
        500,
      ),
    );
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;

  next();
};

export const checkCsrfToken = (req, res, next) => {
  if (!req.session || !req.session.csrfToken) {
    return next(
      new AppError(
        'Security initialization failed. Please refresh the page and try again.',
        500,
      ),
    );
  }

  const tokenFromClient = req.body._csrf || req.headers['x-csrf-token'];

  const tokenFromSession = req.session.csrfToken;

  if (!tokenFromClient) {
    return next(
      new AppError('Request verification failed. Missing token.', 403),
    );
  }

  const clientBuffer = Buffer.from(tokenFromClient);
  const sessionBuffer = Buffer.from(tokenFromSession);

  if (
    clientBuffer.length !== sessionBuffer.length ||
    !crypto.timingSafeEqual(clientBuffer, sessionBuffer)
  ) {
    return next(
      new AppError(
        'Your request could not be verified. Please refresh the page and try again.',
        403,
      ),
    );
  }

  next();
};
