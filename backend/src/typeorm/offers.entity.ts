import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Store } from "./stores.entity";
import { PhoneDevice } from "./phoneDevices.entity";
import { Carrier } from "./carriers.entity";
import { User } from "./users.entity";

@Entity("offers")
export class Offer {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  store_id: number;

  @Column({ type: "int", nullable: false })
  carrier_id: number;

  @Column({ type: "bigint", nullable: false })
  device_id: number;

  @Column({
    type: "enum",
    enum: ["MNP", "CHG"],
    nullable: false,
  })
  offer_type: "MNP" | "CHG";

  @Column({ type: "int", nullable: false })
  price: number;

  @Column({ type: "int", nullable: false, default: 0 })
  sort_order: number;

  @Column({ type: "bigint" })
  updated_by: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @ManyToOne(() => Store, (store) => store.offers)
  @JoinColumn({ name: "store_id" })
  store: Store;

  @ManyToOne(() => PhoneDevice, (device) => device.offers)
  @JoinColumn({ name: "device_id" })
  device: PhoneDevice;

  @ManyToOne(() => Carrier, (carrier) => carrier.offers)
  @JoinColumn({ name: "carrier_id" })
  carrier: Carrier;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updated_by" })
  updatedByUser: User;
}
