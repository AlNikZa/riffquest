// db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Standard (No SRV) connection string
const uri =
  `mongodb://` +
  `${process.env.MONGO_USER}:${process.env.MONGO_PASS}@` +
  `${process.env.MONGO_CLUSTER}-shard-00-00.ni8p3ru.mongodb.net:27017,` +
  `${process.env.MONGO_CLUSTER}-shard-00-01.ni8p3ru.mongodb.net:27017,` +
  `${process.env.MONGO_CLUSTER}-shard-00-02.ni8p3ru.mongodb.net:27017/` +
  `${process.env.MONGO_DB}?ssl=true&replicaSet=atlas-8k4j0x-shard-0&authSource=admin&retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.error('MongoDB connection error ❌', err));

export default mongoose;
