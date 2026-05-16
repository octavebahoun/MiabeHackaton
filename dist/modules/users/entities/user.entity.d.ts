export declare enum UserRole {
    USER = "USER",
    ORGANIZER = "ORGANIZER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export declare enum KycStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export declare class User {
    id: string;
    phone: string;
    password_hash: string;
    full_name: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    phone_verified: boolean;
    kyc_status: KycStatus;
    credit_score: number;
    wallet_address: string;
    created_at: Date;
    updated_at: Date;
}
