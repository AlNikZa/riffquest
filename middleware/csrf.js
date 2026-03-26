// middleware/csrf.js

import crypto from 'crypto';

import { createSecurityError } from '../mappers/errorRegistry/securityErrors.js';

export const createCsrfToken = (req, res, next) => {
  if (req.method !== 'GET') return next();
  if (!req.session) {
    return next(createSecurityError('sessionMissing'));
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;

  next();
};

export const checkCsrfToken = (req, res, next) => {
  if (!req.session || !req.session?.csrfToken) {
    return next(
      createSecurityError('sessionExpired', {
        session: req.session,
        csrfToken: req.session?.csrfToken,
      }),
    );
  }

  const tokenFromClient = req.body._csrf || req.headers['x-csrf-token'];

  const tokenFromSession = req.session.csrfToken;

  if (!tokenFromClient) {
    return next(createSecurityError('csrfTokenMissing'));
  }

  const clientBuffer = Buffer.from(String(tokenFromClient || ''));
  const sessionBuffer = Buffer.from(String(tokenFromSession || ''));

  if (
    clientBuffer.length !== sessionBuffer.length ||
    !crypto.timingSafeEqual(clientBuffer, sessionBuffer)
  ) {
    return next(
      createSecurityError('invalidCsrfToken', {
        method: req.method,
        path: req.originalUrl,
        hasBodyToken: !!req.body._csrf,
        hasHeaderToken: !!req.headers['x-csrf-token'],
      }),
    );
  }

  next();
};
