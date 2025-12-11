import express from 'express';

import { isDevelopment } from '../middleware/devMiddleware.js';
import { checkAdminPassword } from '../middleware/devMiddleware.js';

import { getAllRoutesListController } from '../controllers/devController.js';
import { getFileTreeController } from '../controllers/devController.js';

const router = express.Router();

router.get(
  '/dev/routes',
  isDevelopment,
  checkAdminPassword,
  getAllRoutesListController
);

router.get(
  '/dev/filetree',
  isDevelopment,
  checkAdminPassword,
  getFileTreeController
);

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
// router.get('/test/auth/login/:id', isDevelopment, checkAdminPassword, (req, res) => {
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
