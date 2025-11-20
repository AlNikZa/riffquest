// /middleware/validationHandler.js
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('error', {
      title: 'Invalid input',
      message: 'Invalid input',
      status: 400,
      artist: req.query.artist || undefined,
      album: req.query.album || undefined,
      track: req.query.track || undefined,
    });
  }

  next();
};
