// middleware/csrf.js

import crypto from 'crypto';

import { AppError } from '../AppError.js';

export const createCsrfToken = (req, res, next) => {
  if (req.method !== 'GET') return next();
  if (!req.session) {
    return next(
      new AppError(
        'Something went wrong while loading the page. Please refresh and try again.',
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
        'Your session may have expired. Please refresh the page and try again.',
        403,
      ),
    );
  }

  const tokenFromClient = req.body._csrf || req.headers['x-csrf-token'];

  const tokenFromSession = req.session.csrfToken;

  if (!tokenFromClient) {
    return next(
      new AppError(
        'Your session has timed out. Please refresh the page before submitting.',
        403,
      ),
    );
  }

  const clientBuffer = Buffer.from(String(tokenFromClient || ''));
  const sessionBuffer = Buffer.from(String(tokenFromSession || ''));

  if (
    clientBuffer.length !== sessionBuffer.length ||
    !crypto.timingSafeEqual(clientBuffer, sessionBuffer)
  ) {
    return next(
      new AppError(
        'We couldn’t verify your request. This usually happens if the page was open too long—please refresh and try again.',
        403,
      ),
    );
  }

  next();
};
