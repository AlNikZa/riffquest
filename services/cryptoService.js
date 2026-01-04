// services/cryptoService.js

import crypto from 'crypto';
import { AppError } from '../AppError.js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY) {
  throw new Error('FATAL: ENCRYPTION_KEY environment variable is missing.');
}
if (Buffer.byteLength(ENCRYPTION_KEY, 'utf8') !== 32) {
  throw new Error(
    `FATAL: ENCRYPTION_KEY must be 32 bytes (currently ${Buffer.byteLength(
      ENCRYPTION_KEY,
      'utf8'
    )} bytes).`
  );
}

// --- Encrypting ---

export const encrypt = (stringToBeEncrypted) => {
  if (typeof stringToBeEncrypted !== 'string') {
    throw new AppError('Encryption failed: input must be a string.', 500);
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'utf8'),
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(stringToBeEncrypted, 'utf8'),
      cipher.final(),
    ]);

    const result = Buffer.concat([iv, encrypted]).toString('base64');

    return result;
  } catch (error) {
    throw new AppError('Failed to encrypt sensitive data.', 500);
  }
};

// --- Decrypting ---

export const decrypt = (stringToBeDecrypted) => {
  if (!stringToBeDecrypted || typeof stringToBeDecrypted !== 'string') {
    throw new AppError('Invalid session data: No token provided.', 401);
  }

  try {
    const encryptedData = Buffer.from(stringToBeDecrypted, 'base64');
    if (encryptedData.length < IV_LENGTH) {
      throw new AppError('Decryption failed: invalid token format.', 401);
    }

    const ivFromResult = encryptedData.slice(0, IV_LENGTH);
    const encryptedText = encryptedData.slice(IV_LENGTH);

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'utf8'),
      ivFromResult
    );

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    const result = decrypted.toString('utf8');
    return result;
  } catch (error) {
    throw new AppError('Session decryption failed. Please log in again.', 401);
  }
};

/**
 * NOTE:
 * Currently using AES-256-CBC for server-side token encryption.
 * This is acceptable because ciphertext is never user-controlled.
 *
 * Migration to AES-256-GCM (AEAD) is planned during
 * TypeScript + API-only refactor to gain integrity guarantees.
 */
