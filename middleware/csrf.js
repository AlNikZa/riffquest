import crypto from 'crypto';

export const createCsrfToken = (req, res, next) => {
  if (!req.session) return res.status(500).send('Session not initialized');

  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;

  next();
};

export const checkCsrfToken = (req, res, next) => {
  if (!req.session) return res.status(500).send('Session not initialized');

  const tokenFromClient =
    req.body._csrf || req.headers['x-csrf-token'] || req.query._csrf;

  const tokenFromSession = req.session.csrfToken;

  if (!tokenFromClient || tokenFromClient !== tokenFromSession) {
    return res.status(403).send('Invalid CSRF token');
  }

  next();
};
