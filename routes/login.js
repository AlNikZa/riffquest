import express from 'express';
const router = express.Router();

import { loginLimiter } from '../config/rateLimit.js';
import {
  loginController,
  loginCallbackController,
  resetLoginFlagController,
} from '../controllers/loginController.js';

router.get('/login', loginLimiter, loginController);

router.get('/callback', loginCallbackController);

router.post('/reset-login-flag', resetLoginFlagController);

export default router;
