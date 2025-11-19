// -------------------------------------------------------------
// Server Entry Point
// -------------------------------------------------------------
// Responsible for launching the application, connecting to the database, and starting the server
// - Loads environment variables
// - Establishes database connection
// - Starts the Express server and listens for incoming requests
// -------------------------------------------------------------

// Load environment variables from .env file
import './config/env.js';

// Import the pre-configured Express application
import app from './app.js';

// Import MongoDB connection configuration
import mongoose from './config/db.js';

// Ensure MongoDB connection is fully established before starting the server
await mongoose.connection.asPromise();

// Start the Express server and listen for incoming requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
