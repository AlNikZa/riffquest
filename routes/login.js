import express from 'express';

import { loginLimiter } from '../config/rateLimit.js';
import {
  loginController,
  loginCallbackController,
  resetLoginFlagController,
} from '../controllers/loginController.js';
import { handleValidationErrors } from '../middleware/validationHandler.js';
import { loginCallbackValidator } from '../validators/loginValidator.js';

const router = express.Router();

router.get('/login', loginLimiter, loginController);

router.get(
  '/callback',
  loginCallbackValidator,
  handleValidationErrors,
  loginCallbackController
);

router.post('/reset-login-flag', resetLoginFlagController);

export default router;
