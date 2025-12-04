// -------------------------------------------------------------
// App Initialization File
// -------------------------------------------------------------
// This file configures and initializes the Express application:
// - Sets up view engine and static assets
// - Applies global middleware (security, sessions, rate limiting)
// - Registers all application routes
// - Attaches global error handlers
// -------------------------------------------------------------

// Built-in Node.js modules
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Installed npm packages
import express from 'express';
import { sessionInit } from './config/session.js';
import { helmetConfig } from './config/helmet.js';
import { generalLimiter } from './config/rateLimit.js';

// Custom application middleware
import { createCsrfToken } from './middleware/csrf.js';
import { setReturnToCookie } from './middleware/returnTo.js';
import { userSessionMiddleware } from './middleware/userSession.js';
import {
  notFoundHandler,
  globalErrorHandler,
} from './middleware/errorHandler.js';
import { noCacheMiddleware } from './middleware/noCacheMiddleware.js';

// Import services needed before handling any requests
import { initToken } from './services/globalTokenService.js';

// Application routes
import homeRoutes from './routes/home.js';
import artistRoutes from './routes/artist.js';
import loginRoutes from './routes/login.js';
import logoutRoutes from './routes/logout.js';

// Create Express application
const app = express();

// Trust the first proxy to correctly detect HTTPS and client IP (needed for secure cookies)
app.set('trust proxy', 1);

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure EJS view engine and views directory
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static assets and parse incoming requests
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers (Helmet)
app.use(helmetConfig);
// Session management
app.use(sessionInit());
// Global rate limiting
app.use(generalLimiter);
// Prevent caching of dynamic pages (skip static files automatically)
app.use(noCacheMiddleware);
// Store current URL for post-login redirect
app.use(setReturnToCookie);
// Expose user session data to all views
app.use(userSessionMiddleware);
// CSRF token generator for GET routes
app.use(createCsrfToken);

// Initialize the global Spotify API token before handling any requests
// This ensures the token is available for all routes and services
await initToken();

// Register application routes
app.use('/', homeRoutes);
app.use('/', artistRoutes);
app.use('/', loginRoutes);
app.use('/', logoutRoutes);

// 404 handler (no route matched)
app.use('/', notFoundHandler);
// Global error handler (must be last)
app.use('/', globalErrorHandler);

export default app;
