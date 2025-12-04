import express from 'express';

import { logoutController } from '../controllers/logoutController.js';
import { checkCsrfToken } from '../middleware/csrf.js';

const router = express.Router();

router.post('/logout', checkCsrfToken, logoutController);

export default router;
