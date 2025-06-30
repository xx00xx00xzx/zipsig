/**
 * Generates a cryptographically secure password
 * @param length - Password length (default: 16)
 * @returns Generated password string
 */
export const generateSecurePassword = (length: number = 16): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => charset[byte % charset.length]).join('');
};

/**
 * Encrypts a file using AES-CBC with PBKDF2 key derivation
 * @param data - File data as Uint8Array
 * @param password - Encryption password
 * @returns Encrypted data with salt and IV
 */
export const encryptFile = async (
  data: Uint8Array,
  password: string
): Promise<{ encryptedData: Uint8Array; salt: Uint8Array; iv: Uint8Array }> => {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt']
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    data
  );

  return {
    encryptedData: new Uint8Array(encryptedBuffer),
    salt,
    iv
  };
};

/**
 * Decrypts a file encrypted with encryptFile
 * @param encryptedData - Encrypted file data
 * @param password - Decryption password
 * @param salt - Salt used for encryption
 * @param iv - IV used for encryption
 * @returns Decrypted data
 */
export const decryptFile = async (
  encryptedData: Uint8Array,
  password: string,
  salt: Uint8Array,
  iv: Uint8Array
): Promise<Uint8Array> => {
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-CBC', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    encryptedData
  );

  return new Uint8Array(decryptedBuffer);
};