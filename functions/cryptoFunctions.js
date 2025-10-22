import crypto from 'crypto';

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'fKfg834a9f96h05d34eJIfDgIOfOdfoi';

const IV_LENGTH = 16;

// --- Encrypting ---

export const encrypt = (stringToBeEncrypted) => {
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
};

const encryptedString = encrypt('uB6i-W0eQYwdFvHl7PSZHu9TOvSC');
console.log(encryptedString);

// --- Decrypting ---

export const decrypt = (stringToBeDecrypted) => {
  const encryptedData = Buffer.from(stringToBeDecrypted, 'base64');
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
};

const decryptedString = decrypt(encryptedString);
console.log(decryptedString);
