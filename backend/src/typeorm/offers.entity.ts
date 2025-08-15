import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  offer_id!: number;

  @Column({ type: 'bigint' })
  store_id!: number;

  @Column({ type: 'int' })
  carrier_id!: number;

  @Column({ type: 'bigint' })
  device_id!: number;

  @Column({
    type: 'enum',
    enum: ['MNP', 'CHG'],
  })
  offer_type!: 'MNP' | 'CHG';

  @Column({ type: 'int' })
  price!: number;

  @CreateDateColumn()
  created_at!: Date;
}
