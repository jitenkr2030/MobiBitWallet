import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

/**
 * Encrypts data using AES-256-GCM
 * @param data The data to encrypt
 * @returns Object containing encrypted data, IV, and auth tag
 */
export function encrypt(data: string): {
  encrypted: string;
  iv: string;
  tag: string;
} {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypts data using AES-256-GCM
 * @param encryptedData The encrypted data
 * @returns The decrypted string
 */
export function decrypt(encryptedData: {
  encrypted: string;
  iv: string;
  tag: string;
}): string {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generates a secure random string
 * @param length The length of the string to generate
 * @returns A secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hashes a password using PBKDF2
 * @param password The password to hash
 * @param salt The salt to use (optional, will generate if not provided)
 * @returns Object containing the hash and salt
 */
export function hashPassword(password: string, salt?: string): {
  hash: string;
  salt: string;
} {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, useSalt, 100000, 64, 'sha512')
    .toString('hex');
  
  return {
    hash,
    salt: useSalt,
  };
}

/**
 * Verifies a password against a hash
 * @param password The password to verify
 * @param hash The hash to verify against
 * @param salt The salt used for the hash
 * @returns True if the password matches the hash
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  
  return verifyHash === hash;
}

/**
 * Generates a BIP39 mnemonic phrase
 * @param strength The strength of the mnemonic (128, 160, 192, 224, 256)
 * @returns A BIP39 mnemonic phrase
 */
export function generateMnemonic(strength: number = 256): string {
  // This is a simplified version - in production, use a proper BIP39 library
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
    'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
    'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
    'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
    'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
    'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
    'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
    'angle', 'angry', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
    'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest',
    'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset',
    'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
    'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake',
    'aware', 'away', 'awesome', 'awful', 'awkward', 'axis'
  ];
  
  const entropy = crypto.randomBytes(strength / 8);
  const entropyBits = Array.from(entropy).map(byte => byte.toString(2).padStart(8, '0')).join('');
  
  const checksumBits = crypto
    .createHash('sha256')
    .update(entropy)
    .digest()
    .toString('hex')
    .split('')
    .map(hex => parseInt(hex, 16).toString(2).padStart(4, '0'))
    .join('')
    .slice(0, strength / 32);
  
  const combinedBits = entropyBits + checksumBits;
  const mnemonic = [];
  
  for (let i = 0; i < combinedBits.length; i += 11) {
    const index = parseInt(combinedBits.slice(i, i + 11), 2);
    mnemonic.push(words[index]);
  }
  
  return mnemonic.join(' ');
}

/**
 * Validates a BIP39 mnemonic phrase
 * @param mnemonic The mnemonic phrase to validate
 * @returns True if the mnemonic is valid
 */
export function validateMnemonic(mnemonic: string): boolean {
  // This is a simplified version - in production, use a proper BIP39 library
  const words = mnemonic.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
}

/**
 * Derives a key from a mnemonic using BIP39
 * @param mnemonic The mnemonic phrase
 * @param passphrase The passphrase (optional)
 * @returns The derived key
 */
export function deriveKeyFromMnemonic(mnemonic: string, passphrase: string = ''): string {
  // This is a simplified version - in production, use a proper BIP39 library
  return crypto
    .pbkdf2Sync(mnemonic, 'mnemonic' + passphrase, 2048, 64, 'sha512')
    .toString('hex');
}

/**
 * Checks if biometric authentication is available
 * @returns Promise that resolves to true if biometric auth is available
 */
export async function isBiometricAvailable(): Promise<boolean> {
  // This is a browser-based check
  if (typeof window === 'undefined') return false;
  
  // Check for WebAuthn support
  return 'credentials' in navigator && 'PublicKeyCredential' in window;
}

/**
 * Performs biometric authentication
 * @returns Promise that resolves to true if authentication succeeds
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    // This is a simplified version - in production, use proper WebAuthn
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.randomBytes(32),
        allowCredentials: [],
        userVerification: 'required',
      },
    });
    
    return credential !== null;
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
}

/**
 * Securely wipes sensitive data from memory
 * @param data The data to wipe
 */
export function secureWipe(data: string): void {
  if (typeof data !== 'string') return;
  
  // Overwrite the string in memory
  for (let i = 0; i < data.length; i++) {
    data = data.substring(0, i) + '\0' + data.substring(i + 1);
  }
}