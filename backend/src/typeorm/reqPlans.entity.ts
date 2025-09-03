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

  @Column({ name: "store_id", type: "bigint", nullable: false })
  @Index()
  storeId: number;

  @Column({ name: "carrier_id", type: "int", nullable: false })
  @Index()
  carrierId: number;

  @Column({ name: "monthly_fee", type: "int", nullable: false })
  monthlyFee: number;

  @ManyToOne(() => Store, (store) => store.reqPlans)
  @JoinColumn({ name: "store_id" })
  store: Store;

  @ManyToOne(() => Carrier, (carrier) => carrier.reqPlans)
  @JoinColumn({ name: "carrier_id" })
  carrier: Carrier;
}
