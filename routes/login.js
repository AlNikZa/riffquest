import express from 'express';

import { loginLimiter } from '../config/rateLimit.js';
import {
  loginController,
  loginCallbackController,
  resetLoginFlagController,
} from '../controllers/loginController.js';

const router = express.Router();

router.get('/login', loginLimiter, loginController);

router.get('/callback', loginCallbackController);

router.post('/reset-login-flag', resetLoginFlagController);

export default router;
