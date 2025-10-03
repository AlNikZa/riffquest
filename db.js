import mongoose from 'mongoose';

// Construct MongoDB SRV connection string using environment variables
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}.${process.env.MONGO_HOST}.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log('MongoDB connected ✅ (SRV)'))
  .catch((err) => {
    console.error('MongoDB connection error ❌', err);
    throw err;
  });

export default mongoose;
