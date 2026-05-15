export declare enum ContributionStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    FAILED = "FAILED",
    BLOCKCHAIN_FAILED = "BLOCKCHAIN_FAILED"
}
export declare enum PaymentMethod {
    MTN_MOMO = "MTN_MOMO",
    MOOV_MONEY = "MOOV_MONEY"
}
export declare class Contribution {
    id: string;
    cycle_id: string;
    member_id: string;
    amount: number;
    payment_ref: string;
    cinetpay_trans_id: string;
    status: ContributionStatus;
    payment_method: PaymentMethod;
    blockchain_confirmed: boolean;
    blockchain_tx_hash: string;
    proof_hash: string;
    paid_at: Date;
    created_at: Date;
}
