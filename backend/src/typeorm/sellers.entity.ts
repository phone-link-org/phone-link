import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { User } from './users.entity';
import { Store } from './stores.entity';

@Entity('sellers')
export class Seller {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    seller_id: number;

    @Column({ type: 'bigint' })
    @Index()
    user_id: number;

    @Column({ type: 'bigint' })
    @Index()
    store_id: number;

    @ManyToOne(() => User, user => user.sellers)
    user: User;

    @ManyToOne(() => Store, store => store.sellers)
    store: Store;
}
