import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Tontine } from './tontine.entity';
import { User } from '../../users/entities/user.entity';

export enum MemberRole {
  ORGANIZER = 'ORGANIZER',
  MEMBER = 'MEMBER',
}

export enum MemberStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

@Entity('tontine_members')
@Unique(['tontine_id', 'user_id']) // Un utilisateur ne peut rejoindre qu'une fois
export class TontineMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tontine_id: string;

  @ManyToOne(() => Tontine, tontine => tontine.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tontine_id' })
  tontine: Tontine;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.PENDING })
  status: MemberStatus;

  @Column({ type: 'int', nullable: true })
  payout_order: number;

  @CreateDateColumn()
  joined_at: Date;
}
