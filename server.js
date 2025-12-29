// server.js

// -----------------------------------------------------------------------------
// Server Entry Point
// -----------------------------------------------------------------------------
// This file is responsible for the application's bootstrap process:
// 1. Loads environment variables.
// 2. Establishes a persistent connection to the database.
// 3. Initializes essential external services (Spotify Global Token).
// 4. Starts the Express HTTP server to listen for incoming requests.
// -----------------------------------------------------------------------------

// // Load environment variables
import './config/env.js';

// Import the pre-configured Express application
import app from './app.js';

// Import MongoDB connection configuration
import mongoose from './config/db.js';

// Import services that must be ready before the server starts
import { initToken } from './services/globalTokenService.js';

// /**
//  * Orchestrates the startup sequence of the application.
//  * Ensures that critical dependencies (DB, API tokens) are resolved
//  * before the server starts accepting traffic.
//  */
async function startServer() {
  try {
    // 1. Ensure MongoDB connection is fully established before starting the server
    await mongoose.connection.asPromise();
    console.log('✅ DB Connected');

    // 2. Service Initialization: Fetch initial Spotify Client Credentials token
    await initToken();
    console.log('✅ Spotify Global Token Initialized');

    // 3. Start Listening: Launch the HTTP server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✅ Server started on port ${PORT}`);

      const emoji = process.env.NODE_ENV === 'production' ? '🚀' : '🛠️';
      if (process.env.NODE_ENV !== 'production')
        process.env.NODE_ENV = 'development';
      console.log(
        emoji,
        `Running in ${process.env.NODE_ENV.toUpperCase()} MODE.`
      );
    });
  } catch (err) {
    // Critical failure: Log the error and terminate the process
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Start the Express server and listen for incoming requests
startServer();
