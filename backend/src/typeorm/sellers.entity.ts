import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { User } from "./users.entity";
import { Store } from "./stores.entity";

@Entity("sellers")
export class Seller {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  seller_id: number;

  @Column({ type: "bigint" })
  @Index()
  user_id: number;

  @Column({ type: "bigint" })
  @Index()
  store_id: number;

  @ManyToOne(() => User, (user) => user.sellers)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Store, (store) => store.sellers)
  @JoinColumn({ name: "store_id" })
  store: Store;
}
