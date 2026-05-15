export declare function generateOtp(): string;
export declare function hashOtp(otp: string): string;
export declare function encryptPrivateKey(privateKey: string, encryptionKey: string): string;
export declare function decryptPrivateKey(encryptedData: string, encryptionKey: string): string;
export declare function generatePaymentRef(): string;
