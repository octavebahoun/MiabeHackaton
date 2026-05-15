import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Génère un OTP à 6 chiffres
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash un OTP avec SHA-256 (pour stockage Redis)
 */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Chiffre une clé privée Ethereum avec AES-256-GCM
 */
export function encryptPrivateKey(privateKey: string, encryptionKey: string): string {
  const iv = crypto.randomBytes(16);
  // Assure que la clé d'encryption fait 32 octets (AES-256)
  const key = crypto.createHash('sha256').update(encryptionKey).digest(); 
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Déchiffre une clé privée Ethereum
 */
export function decryptPrivateKey(encryptedData: string, encryptionKey: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted data format');
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  
  const key = crypto.createHash('sha256').update(encryptionKey).digest();
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function generatePaymentRef(): string {
    return uuidv4();
}
