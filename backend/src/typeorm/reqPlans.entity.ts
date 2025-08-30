import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { Store } from "./stores.entity";
import { Carrier } from "./carriers.entity";

@Entity("req_plans")
export class ReqPlan {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  @Index()
  store_id: number;

  @Column({ type: "int", nullable: false })
  @Index()
  carrier_id: number;

  @Column({ type: "int", nullable: false })
  monthly_fee: number;

  @ManyToOne(() => Store, (store) => store.reqPlans)
  @JoinColumn({ name: "store_id" })
  store: Store;

  @ManyToOne(() => Carrier, (carrier) => carrier.reqPlans)
  @JoinColumn({ name: "carrier_id" })
  carrier: Carrier;
}
