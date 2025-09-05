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
import { OFFER_TYPES, OfferType } from "../../../shared/constants";

@Entity("offers")
export class Offer {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ name: "store_id", type: "bigint", nullable: false })
  storeId: number;

  @Column({ name: "carrier_id", type: "int", nullable: false })
  carrierId: number;

  @Column({ name: "device_id", type: "bigint", nullable: false })
  deviceId: number;

  @Column({
    name: "offer_type",
    type: "enum",
    enum: [OFFER_TYPES.MNP, OFFER_TYPES.CHG],
    nullable: false,
  })
  offerType: OfferType;

  @Column({ type: "int" })
  price: number | null;

  @Column({ name: "sort_order", type: "int", nullable: false, default: 0 })
  sortOrder: number;

  @Column({ name: "updated_by", type: "bigint" })
  updatedBy: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;

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
