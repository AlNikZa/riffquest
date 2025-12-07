import express from 'express';
import listRoutes from 'express-list-routes';

import { notFoundHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const checkAdminPassword = (req, res, next) => {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  const submittedPassword = req.header('x-admin-pass');

  // Reject the request if the password is not set or if they do not match
  if (!expectedPassword || expectedPassword !== submittedPassword) {
    // Use 401 Unauthorized for an incorrect password
    return res.status(401).json({
      message: 'Unauthorized: Invalid access password.',
      error: 'Access denied.',
    });
  }

  // If the passwords match, allow access
  next();
};

const isDevelopment = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return notFoundHandler(req, res, next);
  }
  next();
};

router.get('/dev/routes', isDevelopment, checkAdminPassword, (req, res) => {
  const routes = listRoutes(req.app, { logger: false });
  res.status(200).json(routes);
});

// ====================================================================
// SUGGESTIONS FOR FUTURE DEV ROUTES (Prioritized)
// ====================================================================

/*
// 2. DATABASE STATUS CHECK (DB-status)
// Requires importing Mongoose at the top of the file.
// router.get('/db-status', isDevelopment, checkAdminPassword, (req, res) => {
//     const status = mongoose.connection.readyState;
//     const statusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
//     res.status(200).json({ status: statusMap[status], code: status });
// });

// 3. SESSION VIEW (Session Viewer)
// router.get('/session-view', isDevelopment, checkAdminPassword, (req, res) => {
//     // Check that req.session exists before returning
//     res.status(200).json({ currentSession: req.session || {} }); 
// });

// 4. FAST LOGIN (Test User Injection)
// router.get('/test/login/:id', isDevelopment, checkAdminPassword, (req, res) => {
//     req.session.user = { id: req.params.id, username: `TestUser_${req.params.id}`, isAdmin: true };
//     req.session.isLoggedIn = true;
//     req.session.save(() => {
//         res.status(200).json({ message: 'Forced login successful.' });
//     });
// });

// 5. ENVIRONMENT CONFIGURATION (Config Viewer)
// router.get('/config', isDevelopment, checkAdminPassword, (req, res) => {
//     // Filter out sensitive variables (secrets, keys, passwords)
//     const safeEnv = Object.keys(process.env).filter(key => 
//         !key.includes('SECRET') && !key.includes('KEY') && !key.includes('PASSWORD')
//     ).reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {});
//     res.status(200).json(safeEnv);
// });

// 6. FORCE ERROR (Error Handler Test)
// router.get('/force-error', isDevelopment, checkAdminPassword, (req, res, next) => {
//     // Intentionally throws an error to check the global error handler response
//     next(new Error('DEV_TEST: Forced error to check error handler response.')); 
// });
*/

export default router;
