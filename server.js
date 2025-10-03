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
import './config.js';

import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initToken } from './functions/tokenFunctions.js';
import mongoose from './db.js';

// Import route modules
import homeRoutes from './routes/home.js';
import artistRoutes from './routes/artist.js';
import errorRoutes from './routes/error.js';
import loginRoutes from './routes/login.js';

const app = express();

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

// Initialize Spotify API token before loading routes
await initToken();

// Wait for MongoDB connection
await mongoose.connection.asPromise();

// Register application routes
app.use('/', homeRoutes);
app.use('/', artistRoutes);
app.use('/', loginRoutes);
app.use('/', errorRoutes); // Handles 404 and global errors

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
