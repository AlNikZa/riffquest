// server.js
// -------------------------------------------------------------
// RiffQuest Main Server File
// - Initializes Express application
// - Configures middleware and view engine
// - Loads route modules
// - Connects to MongoDB
// - Initializes Spotify API token
// -------------------------------------------------------------

// Load environment variables from .env into process.env before running the rest of the app
import './config/env.js';

// imports
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initToken } from './functions/globalTokenFunctions.js';
import { setReturnToCookie } from './middleware/returnTo.js';
import { userSessionMiddleware } from './middleware/userSession.js';
import mongoose from './config/db.js';
import { sessionInit } from './config/session.js';

// Import route modules
import homeRoutes from './routes/home.js';
import artistRoutes from './routes/artist.js';
import errorRoutes from './routes/error.js';
import loginRoutes from './routes/login.js';
import logoutRoutes from './routes/logout.js';

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
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Wait for MongoDB connection
await mongoose.connection.asPromise();

// Configure session middleware
app.use(sessionInit());
// Middleware that stores the current URL  cookie for post-login redirection
app.use(setReturnToCookie);
// Make login status available to all EJS views
app.use(userSessionMiddleware);
// Initialize Spotify API token before loading routes
await initToken();

// Register application routes
app.use('/', homeRoutes);
app.use('/', artistRoutes);
app.use('/', loginRoutes);
app.use('/', logoutRoutes);
app.use('/', errorRoutes); // Handles 404 and global errors

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
