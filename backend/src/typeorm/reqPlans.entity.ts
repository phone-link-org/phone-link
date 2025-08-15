import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Store } from './stores.entity';
import { Carrier } from './carriers.entity';

@Entity('req_plans')
export class ReqPlan {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    req_plan_id: number;

    @Column({ type: 'bigint' })
    @Index()
    store_id: number;

    @Column({ type: 'int' })
    @Index()
    carrier_id: number;

    @Column({ type: 'int' })
    monthly_fee: number;

    @ManyToOne(() => Store, store => store.reqPlans)
    store: Store;

    @ManyToOne(() => Carrier, carrier => carrier.reqPlans)
    carrier: Carrier;
}
