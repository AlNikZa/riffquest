// config/db.js

import { config } from './env.js';
import mongoose from 'mongoose';

const connectDB = async () => {
  // Handle initial connection errors and runtime errors
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err);
  });
  try {
    // Connect to MongoDB
    return await mongoose.connect(config.mongo.uri);
  } catch (err) {
    // Log and re-throw initial connection errors
    console.error(`❌ Initial MongoDB connection failed: ${err.message}`);
    throw err;
  }
};

export default connectDB;
