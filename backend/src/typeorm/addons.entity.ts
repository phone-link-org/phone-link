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

  @Column({ name: "store_id", type: "bigint", nullable: false })
  @Index()
  storeId: number;

  @Column({ name: "carrier_id", type: "int", nullable: false })
  @Index()
  carrierId: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  name: string;

  @Column({ name: "monthly_fee", type: "int", nullable: false })
  monthlyFee: number;

  @Column({ name: "duration_months", type: "int", nullable: false })
  durationMonths: number;

  @Column({ name: "penalty_fee", type: "int", nullable: false })
  penaltyFee: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;

  @ManyToOne(() => Store, (store) => store.addons)
  @JoinColumn({ name: "store_id" })
  store: Store;

  @ManyToOne(() => Carrier, (carrier) => carrier.addons)
  @JoinColumn({ name: "carrier_id" })
  carrier: Carrier;
}
