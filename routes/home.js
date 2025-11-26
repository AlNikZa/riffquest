import express from 'express';

import {
  homePageController,
  cookiePolicyPageController,
} from '../controllers/homeController.js';

const router = express.Router();

/* ------------------------------------------------------------- */
/* ---------------------- Home Page Route ---------------------- */
/* ------------------------------------------------------------- */

router.get('/', homePageController);

/* ------------------------------------------------------------- */
/* -------------------- Cookie Policy Route -------------------- */
/* ------------------------------------------------------------- */
router.get('/cookie-policy', cookiePolicyPageController);

export default router;
