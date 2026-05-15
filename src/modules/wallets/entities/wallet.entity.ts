import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column({ unique: true })
  wallet_address: string;

  @Column()
  encrypted_private_key: string; // AES-256-GCM — jamais retourné au client

  @Column({ default: 'polygon-mumbai' })
  network: string;

  @CreateDateColumn()
  created_at: Date;
}
