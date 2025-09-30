// server.js
// -------------------------------------------------------------
// Main server file for RiffQuest
// - Sets up Express app
// - Configures middleware and view engine
// - Loads routes
// - Initializes Spotify token
// -------------------------------------------------------------

import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initToken } from './functions/tokenFunctions.js';

// Import route modules
import homeRoutes from './routes/home.js';
import artistRoutes from './routes/artist.js';
import errorRoutes from './routes/error.js';
import loginRoutes from './routes/login.js';

const app = express();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up EJS as view engine and views folder
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static assets from the "public" directory
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Spotify API token before routes
await initToken();

// Register routes
app.use('/', homeRoutes); // Home page route
app.use('/', artistRoutes); // Artist-related routes
app.use('/', loginRoutes);
app.use('/', errorRoutes); // 404 + global error handler

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
