import sjcl from 'sjcl';

const ENCRYPTION_KEY = 'your-encryption-key'; // In production, this should be stored securely

export async function encryptData(data: string): Promise<string> {
  try {
    const encrypted = sjcl.encrypt(ENCRYPTION_KEY, data);
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const decrypted = sjcl.decrypt(ENCRYPTION_KEY, encryptedData);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}