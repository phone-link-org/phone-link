import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Store } from "./stores.entity";
import { PhoneDevice } from "./phoneDevices.entity";
import { Carrier } from "./carriers.entity";

@Entity("offers")
export class Offer {
  @PrimaryGeneratedColumn({ type: "bigint" })
  offer_id!: number;

  @Column({ type: "bigint" })
  store_id!: number;

  @Column({ type: "int" })
  carrier_id!: number;

  @Column({ type: "bigint" })
  device_id!: number;

  @Column({
    type: "enum",
    enum: ["MNP", "CHG"],
  })
  offer_type!: "MNP" | "CHG";

  @Column({ type: "int" })
  price!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Store, (store) => store.offers)
  @JoinColumn({ name: "store_id" })
  store: Store;

  @ManyToOne(() => PhoneDevice, (device) => device.offers)
  @JoinColumn({ name: "device_id" })
  device: PhoneDevice;

  @ManyToOne(() => Carrier, (carrier) => carrier.offers)
  @JoinColumn({ name: "carrier_id" })
  carrier: Carrier;
}
