import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Store } from './stores.entity';
import { Carrier } from './carriers.entity';

@Entity('addons')
export class Addon {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    addon_id: number;

    @Column({ type: 'bigint' })
    @Index()
    store_id: number;

    @Column({ type: 'int' })
    @Index()
    carrier_id: number;

    @Column({ type: 'varchar', length: 100 })
    addon_name: string;

    @Column({ type: 'int' })
    monthly_fee: number;

    @Column({ type: 'int' })
    req_duration: number;

    @Column({ type: 'int' })
    penalty_fee: number;

    @ManyToOne(() => Store, store => store.addons)
    store: Store;

    @ManyToOne(() => Carrier, carrier => carrier.addons)
    carrier: Carrier;
}
