import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Tontine } from '../../tontines/entities/tontine.entity';
import { User }    from '../../users/entities/user.entity';

export enum CycleStatus {
  PENDING   = 'PENDING',
  ACTIVE    = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

@Entity('cycles')
export class Cycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tontine_id: string;

  @ManyToOne(() => Tontine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tontine_id' })
  tontine: Tontine;

  @Column({ type: 'int' })
  cycle_number: number;

  @Column('uuid')
  beneficiary_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'beneficiary_id' })
  beneficiary: User;

  @Column({ type: 'enum', enum: CycleStatus, default: CycleStatus.PENDING })
  status: CycleStatus;

  /** Montant total attendu = contribution_amount × nb_membres */
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  total_expected: number;

  /** Montant effectivement collecté via CinetPay */
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  total_collected: number;

  /** Hash de la transaction Polygon du versement au bénéficiaire */
  @Column({ nullable: true })
  payout_tx_hash: string;

  @Column({ type: 'timestamp', nullable: true })
  starts_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ends_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
