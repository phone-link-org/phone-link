import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, JoinColumn } from 'typeorm';
import { PhoneModel } from './phoneModels.entity';
import { PhoneStorage } from './phoneStorage.entity';

@Entity('phone_devices')
export class PhoneDevice {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    @Index()
    model_id: number;

    @Column({ type: 'int' })
    @Index()
    storage_id: number;

    @Column({ type: 'int' })
    retail_price: number;

    @Column({ type: 'int', nullable: true })
    unlocked_price: number;

    @Column({ type: 'text', nullable: true })
    coupang_link: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => PhoneModel, model => model.devices)
    @JoinColumn({ name: 'model_id' })
    model: PhoneModel;

    @ManyToOne(() => PhoneStorage, storage => storage.devices)
    @JoinColumn({ name: 'storage_id' })
    storage: PhoneStorage;
}
