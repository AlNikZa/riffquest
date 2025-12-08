import express from 'express';

import { loginLimiter } from '../config/rateLimit.js';
import {
  loginController,
  loginCallbackController,
  resetLoginFlagController,
} from '../controllers/loginController.js';
import { handleValidationErrors } from '../middleware/validationHandler.js';
import { checkCsrfToken } from '../middleware/csrf.js';
import { loginCallbackValidator } from '../validators/loginValidator.js';

const router = express.Router();

router.get('/auth/login', loginLimiter, loginController);

router.get(
  '/callback',
  loginCallbackValidator,
  handleValidationErrors,
  loginCallbackController
);

router.post('/auth/reset-login-flag', checkCsrfToken, resetLoginFlagController);

export default router;
