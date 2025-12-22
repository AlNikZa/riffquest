// services/cryptoService.js

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY).length !== 32) {
  throw new Error(
    'FATAL: ENCRYPTION_KEY environment variable must be exactly 32 characters long.'
  );
}

// --- Encrypting ---

export const encrypt = (stringToBeEncrypted) => {
  try {
    if (typeof stringToBeEncrypted !== 'string') {
      throw new Error('Data to be encrypted must be a string.');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY),
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(stringToBeEncrypted, 'utf8'),
      cipher.final(),
    ]);

    const result = Buffer.concat([iv, encrypted]).toString('base64');

    return result;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Encryption failed:', error.message);
    }
    throw error;
  }
};

// --- Decrypting ---

export const decrypt = (stringToBeDecrypted) => {
  try {
    if (!stringToBeDecrypted || typeof stringToBeDecrypted !== 'string') {
      return null;
    }

    const encryptedData = Buffer.from(stringToBeDecrypted, 'base64');
    if (encryptedData.length < IV_LENGTH) {
      throw new Error('Invalid encrypted data format.');
    }

    const ivFromResult = encryptedData.slice(0, IV_LENGTH);
    const encryptedText = encryptedData.slice(IV_LENGTH);

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY),
      ivFromResult
    );

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    const result = decrypted.toString();
    return result;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Decryption failed:', error.message);
    }
    return null;
  }
};
