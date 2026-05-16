import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TontineMember } from './tontine-member.entity';

export enum TontineFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum TontineStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('tontines')
export class Tontine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  organizer_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column('decimal', { precision: 12, scale: 2 })
  contribution_amount: number;

  @Column({ type: 'enum', enum: TontineFrequency })
  frequency: TontineFrequency;

  @Column({ type: 'int' })
  max_members: number;

  @Column({ type: 'enum', enum: TontineStatus, default: TontineStatus.DRAFT })
  status: TontineStatus;

  @Column({ unique: true })
  invitation_code: string;

  @Column({ nullable: true })
  contract_address: string;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'int', default: 1 })
  max_absences: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  penalty_amount: number;

  @OneToMany(() => TontineMember, (member) => member.tontine)
  members: TontineMember[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
