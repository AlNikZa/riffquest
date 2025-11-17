import express from 'express';
const router = express.Router();

import {
  homePageController,
  cookiePolicyPageController,
} from '../controllers/homeController.js';
/* ------------------------------------------------------------- */
/* ---------------------- Home Page Route ---------------------- */
/* ------------------------------------------------------------- */

router.get('/', homePageController);

/* ------------------------------------------------------------- */
/* -------------------- Cookie Policy Route -------------------- */
/* ------------------------------------------------------------- */
router.get('/cookie-policy', cookiePolicyPageController);

export default router;
