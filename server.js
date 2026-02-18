// server.js

import { config } from './config/env.js';
import mongoose from 'mongoose';
import {
  registerShutdownHandlers,
  registerCleanupTask,
  freePortBeforeServerStart,
} from './lifecycle.js';
import connectDB from './config/db.js';
import app from './app.js';
import { initToken } from './services/globalTokenService.js';

// Initialize global listeners for process termination and unhandled errors
registerShutdownHandlers();

// Orchestrates the application's startup sequence.
// Ensures all critical services (DB, Auth, etc.) are ready before accepting traffic.
async function startServer() {
  try {
    // 1. Ensure MongoDB connection is fully established before starting the server
    await connectDB();
    console.log('📦 DB Connected');

    // Define cleanup logic for the database connection during shutdown
    registerCleanupTask('MongoDB connection', async () => {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('📦 DB connection closed.');
      }
    });

    // 2. Initialize external dependencies (e.g., Spotify API Client Credentials)
    await initToken();
    console.log('🔑 Spotify Global Token Initialized');

    // 3. Start Listening: Launch the HTTP server
    const server = app.listen(config.port, () => {
      console.log(`📡 Server started on port ${config.port}`);

      const emoji = config.isProd ? '🚀' : '🛠️';

      console.log(
        emoji,
        ` Running in ${config.environment.toUpperCase()} MODE.`,
      );
    });

    // Define cleanup logic for the HTTP server to stop accepting new requests
    registerCleanupTask('HTTP server', async () => {
      await new Promise((resolve) => server.close(resolve));
      console.log('🌐 HTTP server closed.');
    });
  } catch (err) {
    // Critical failure: Log the error and terminate the process
    console.error('🔥 CRITICAL: Failed to start server:', err);
    process.exit(1);
  }
}

(async () => {
  try {
    // 1. Pre-flight check: In development, we clear the port to prevent
    // 'EADDRINUSE' errors if a previous instance didn't exit cleanly.
    if (!config.isProd) {
      await freePortBeforeServerStart(config.port);
    }

    // 2. Initialize the core application services (DB, Auth, Listeners)
    await startServer();
  } catch (error) {
    // Top-level catch to handle any failure during the startup phase
    console.error('💥 Application failed to bootstrap:', error);
    process.exit(1);
  }
})();
