// middleware/devMiddleware.js

import { notFoundHandler } from '../middleware/errorHandler.js';

export const isDevelopment = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return notFoundHandler(req, res, next);
  }
  next();
};

export const checkAdminPassword = (req, res, next) => {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  const submittedPassword = req.header('x-admin-pass');

  // Reject the request if the password is not set or if they do not match
  if (!expectedPassword || expectedPassword !== submittedPassword) {
    // Use 401 Unauthorized for an incorrect password
    return res.status(401).json({
      message: 'Unauthorized: Invalid access password.',
      error: 'Access denied.',
    });
  }

  // If the passwords match, allow access
  next();
};
