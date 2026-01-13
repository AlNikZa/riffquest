// middleware/devMiddleware.js

import crypto from 'crypto';

import { config } from '../config/env.js';

import { notFoundHandler } from '../middleware/errorHandler.js';

export const isDevelopment = (req, res, next) => {
  if (config.isProd) {
    return notFoundHandler(req, res, next);
  }
  next();
};

export const checkAdminPassword = (req, res, next) => {
  const expectedPassword = config.adminPassword;

  const submittedPassword = req.header('x-admin-pass');

  // Reject the request if the password is not set or if they do not match
  if (!expectedPassword || !submittedPassword) {
    // Use 401 Unauthorized for an incorrect password
    return res.status(401).json({
      message: 'Unauthorized: Invalid access password.',
      error: 'Access denied.',
    });
  }

  // Use timingSafeEqual to prevent timing attacks
  const expectedBuffer = Buffer.from(expectedPassword);
  const submittedBuffer = Buffer.from(submittedPassword);

  if (expectedBuffer.length !== submittedBuffer.length) {
    crypto.timingSafeEqual(expectedBuffer, expectedBuffer);
    return res.status(401).json({
      message: 'Unauthorized: Invalid access password.',
      error: 'Access denied.',
    });
  }

  if (!crypto.timingSafeEqual(expectedBuffer, submittedBuffer)) {
    return res.status(401).json({
      message: 'Unauthorized: Invalid access password.',
      error: 'Access denied.',
    });
  }

  // If the passwords match, allow access
  next();
};
