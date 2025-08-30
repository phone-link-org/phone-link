import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  OneToMany,
  Unique,
} from "typeorm";
import { PhoneModel } from "./phoneModels.entity";
import { PhoneStorage } from "./phoneStorage.entity";
import { Offer } from "./offers.entity";

@Entity("phone_devices")
@Unique("uk_model_storage", ["model_id", "storage_id"])
export class PhoneDevice {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  @Index()
  model_id: number;

  @Column({ type: "int", nullable: false })
  @Index()
  storage_id: number;

  @Column({ type: "int", nullable: false })
  retail_price: number;

  @Column({ type: "int" })
  unlocked_price: number;

  @Column({ type: "text" })
  coupang_link: string;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @ManyToOne(() => PhoneModel, (model) => model.devices)
  @JoinColumn({ name: "model_id" })
  model: PhoneModel;

  @ManyToOne(() => PhoneStorage, (storage) => storage.devices)
  @JoinColumn({ name: "storage_id" })
  storage: PhoneStorage;

  @OneToMany(() => Offer, (offer) => offer.device)
  offers: Offer[];
}
