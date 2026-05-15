"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.hashOtp = hashOtp;
exports.encryptPrivateKey = encryptPrivateKey;
exports.decryptPrivateKey = decryptPrivateKey;
exports.generatePaymentRef = generatePaymentRef;
const crypto = require("crypto");
const uuid_1 = require("uuid");
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function hashOtp(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
}
function encryptPrivateKey(privateKey, encryptionKey) {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(encryptionKey).digest();
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
function decryptPrivateKey(encryptedData, encryptionKey) {
    const parts = encryptedData.split(':');
    if (parts.length !== 3)
        throw new Error('Invalid encrypted data format');
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
function generatePaymentRef() {
    return (0, uuid_1.v4)();
}
//# sourceMappingURL=crypto.util.js.map