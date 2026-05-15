import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';

export enum ContributionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  BLOCKCHAIN_FAILED = 'BLOCKCHAIN_FAILED',
}

export enum PaymentMethod {
  MTN_MOMO = 'MTN_MOMO',
  MOOV_MONEY = 'MOOV_MONEY',
}

@Entity('contributions')
export class Contribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  cycle_id: string;

  @Column('uuid')
  member_id: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  /** Référence unique générée côté backend — garantit l'idempotence */
  @Column({ unique: true })
  @Index()
  payment_ref: string;

  @Column({ nullable: true })
  cinetpay_trans_id: string;

  @Column({ type: 'enum', enum: ContributionStatus, default: ContributionStatus.PENDING })
  status: ContributionStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ default: false })
  blockchain_confirmed: boolean;

  @Column({ nullable: true })
  blockchain_tx_hash: string;

  @Column({ nullable: true })
  proof_hash: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
