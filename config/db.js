// config/db.js

import mongoose from 'mongoose';

const connectDB = async () => {
  // Construct MongoDB SRV connection string using environment variables
  const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}.${process.env.MONGO_HOST}.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

  // Handle initial connection errors and runtime errors
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err);
  });
  try {
    // Connect to MongoDB
    return await mongoose.connect(uri);
  } catch (err) {
    // Log and re-throw initial connection errors
    console.error(`❌ Initial MongoDB connection failed: ${err.message}`);
    throw err;
  }
};

export default connectDB;
