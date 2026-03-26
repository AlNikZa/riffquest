// services/cryptoService.js
// consider to remove to ../utils/cryptoUtils.js

import { config } from '../config/env.js';

import crypto from 'crypto';

import { AppError } from '../utils/AppError.js';
import { createSystemError } from '../mappers/errorRegistry/systemErrors.js';
import { createAuthError } from '../mappers/errorRegistry/authErrors.js';

const ENCRYPTION_KEY = config.encryptionKey; // Must be 32 bytes for aes-256
const IV_LENGTH = 16;

// --- Encrypting ---

export const encrypt = (stringToBeEncrypted) => {
  if (typeof stringToBeEncrypted !== 'string') {
    throw createSystemError('invalidEncryptionInput', {
      encryptionInputType: typeof stringToBeEncrypted,
    });
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'utf8'),
      iv,
    );

    const encrypted = Buffer.concat([
      cipher.update(stringToBeEncrypted, 'utf8'),
      cipher.final(),
    ]);

    const result = Buffer.concat([iv, encrypted]).toString('base64');

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw createSystemError('encryptionFailed', {
      cause: error,
    });
  }
};

// --- Decrypting ---

export const decrypt = (stringToBeDecrypted) => {
  if (!stringToBeDecrypted || typeof stringToBeDecrypted !== 'string') {
    throw createAuthError('invalidDecryptionInput', {
      decryptionInputType: typeof stringToBeDecrypted,
    });
  }

  try {
    const encryptedData = Buffer.from(stringToBeDecrypted, 'base64');
    if (encryptedData.length < IV_LENGTH) {
      throw createAuthError('decryptionFailed', {
        inputLength: encryptedData.length,
      });
    }

    const ivFromResult = encryptedData.slice(0, IV_LENGTH);
    const encryptedText = encryptedData.slice(IV_LENGTH);

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'utf8'),
      ivFromResult,
    );

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    const result = decrypted.toString('utf8');
    return result;
  } catch (error) {
    throw createAuthError('decryptionFailed', {
      cause: error,
    });
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
