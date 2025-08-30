import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Store } from "./stores.entity";
import { Carrier } from "./carriers.entity";

@Entity("addons")
export class Addon {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  @Index()
  store_id: number;

  @Column({ type: "int", nullable: false })
  @Index()
  carrier_id: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  name: string;

  @Column({ type: "int", nullable: false })
  monthly_fee: number;

  @Column({ type: "int", nullable: false })
  duration_months: number;

  @Column({ type: "int", nullable: false })
  penalty_fee: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @ManyToOne(() => Store, (store) => store.addons)
  @JoinColumn({ name: "store_id" })
  store: Store;

  @ManyToOne(() => Carrier, (carrier) => carrier.addons)
  @JoinColumn({ name: "carrier_id" })
  carrier: Carrier;
}
