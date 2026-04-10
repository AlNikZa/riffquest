// config/env.js

/* Loads environment variables from the .env file 
into process.env globally 
so they can be accessed anywhere in the app
*/

import { deepFreeze } from '../utils/plainObjectUtils.js';

import dotenv from 'dotenv';
dotenv.config();

const requiredVars = [
  'MUSIC_BRAINZ_USER_AGENT',
  'LASTFM_API_KEY',
  'FANARTTV_API_KEY',
  'MONGO_USER',
  'MONGO_PASS',
  'MONGO_DB',
  'MONGO_CLUSTER',
  'MONGO_HOST',
  'BASE_URL_DEV',
  'BASE_URL_PROD',
  'SESSION_SECRET',
  'ENCRYPTION_KEY',
  //   'ADMIN_PASSWORD', // Optional: only needed if admin features are used
];

// Validate required environment variables
requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`💥 CRITICAL: Missing environment variable: ${varName}`);
    process.exit(1);
  }
});

const environment = process.env.NODE_ENV || 'development';
const isProd = environment === 'production';

const appBaseUrl = isProd
  ? process.env.BASE_URL_PROD
  : process.env.BASE_URL_DEV;

// Create config object
const config = {
  environment,
  isProd,
  port: process.env.PORT || 3000,
  appBaseUrl,
  musicBrainz: {
    userAgent: process.env.MUSIC_BRAINZ_USER_AGENT,
    baseUrl: 'https://musicbrainz.org/ws/2/',
    format: 'json',
  },
  lastFm: {
    apiKey: process.env.LASTFM_API_KEY,
    baseUrl: 'https://ws.audioscrobbler.com/2.0/',
  },
  fanartTv: {
    apiKey: process.env.FANARTTV_API_KEY,
    baseUrl: 'https://webservice.fanart.tv/v3',
  },
  mongo: {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS,
    db: process.env.MONGO_DB,
    cluster: process.env.MONGO_CLUSTER,
    host: process.env.MONGO_HOST,
    uri: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}.${process.env.MONGO_HOST}.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
  },
  adminPassword: process.env.ADMIN_PASSWORD,
  sessionSecret: process.env.SESSION_SECRET,
  encryptionKey: process.env.ENCRYPTION_KEY,
};

const forbiddenChars = /[ :/?#\[\]@%]/;
const sensitiveMongoVars = [
  { name: 'MONGO_USER', value: config.mongo.user },
  { name: 'MONGO_PASS', value: config.mongo.pass },
];
// Validate that MongoDB credentials do not contain forbidden URL characters
sensitiveMongoVars.forEach(({ name, value }) => {
  if (forbiddenChars.test(value)) {
    console.error(
      `💥 SECURITY ERROR: ${name} contains forbidden URL characters (space : / ? # [ ] @ %).`,
    );
    console.error(
      `👉 Please change your MongoDB credentials to avoid connection string corruption.`,
    );
    process.exit(1);
  }
});

// Validate ENCRYPTION_KEY length
const keyLength = Buffer.byteLength(config.encryptionKey, 'utf8');
if (keyLength !== 32) {
  console.error(
    `💥 FATAL: ENCRYPTION_KEY must be exactly 32 bytes (currently ${keyLength} bytes).`,
  );
  process.exit(1);
}

deepFreeze(config);

// Export the only source of truth for the entire application
export { config };
