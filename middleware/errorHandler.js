// middleware/errorHandler.js

import { AppError } from '../utils/AppError.js';
import { logError, getFinalMessage } from '../utils/errorHelpers.js';

import { getViewContext } from '../mappers/viewContextMapper.js';

import { createRoutingError } from '../mappers/errorRegistry/routingErrors.js';
import { createSystemError } from '../mappers/errorRegistry/systemErrors.js';

import { handleUnauthorizedError } from '../services/unauthorizedService.js';

// 404 handler
export const notFoundHandler = (req, res, next) => {
  next(
    createRoutingError('nothingFound', {
      method: req.method,
      originalUrl: req.originalUrl,
    }),
  );
};

// Global error handler
// This middleware will catch errors thrown in async routes or anywhere else
export const globalErrorHandler = async (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // If the error is not an instance of AppError, convert it into an AppError
  let error = err;
  if (!(err instanceof AppError)) {
    error = createSystemError('unexpectedError', {
      errorName: err.name,
      errorMessage: err.message,
      originalUrl: req.originalUrl,
      method: req.method,
      cause: err,
    });
  }

  const cleanErrors = error.validationErrors ? error.validationErrors : null;
  const statusCode = error.statusCode;

  const finalMessage = getFinalMessage(error);

  logError(error);

  // Handle 401 errors by removing tokens and destroying session
  if (statusCode === 401) {
    return await handleUnauthorizedError({
      req,
      res,
      cleanErrors,
      getViewContext,
    });
  }

  // If it is 404 → render noResultsFound.ejs
  if (statusCode === 404) {
    return res.status(404).render('noResultsFound', {
      title: 'Nothing found',
      message: finalMessage,
      ...getViewContext(req, res, cleanErrors),
    });
  }

  // Else render error.ejs
  return res.status(statusCode).render('error', {
    title: 'Error',
    message: finalMessage,
    statusCode: statusCode,
    ...getViewContext(req, res, cleanErrors),
  });
};
