import { PaymentMethod } from '../entities/contribution.entity';
export declare class InitiateContributionDto {
    cycle_id: string;
    payment_method: PaymentMethod;
    phone_number: string;
}
