import { TontineFrequency } from '../entities/tontine.entity';
export declare class CreateTontineDto {
    name: string;
    contribution_amount: number;
    frequency: TontineFrequency;
    max_members: number;
    start_date?: Date;
    max_absences?: number;
    penalty_amount?: number;
}
