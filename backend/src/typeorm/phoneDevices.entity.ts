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
@Unique("uk_model_storage", ["modelId", "storageId"])
export class PhoneDevice {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ name: "model_id", type: "bigint", nullable: false })
  @Index()
  modelId: number;

  @Column({ name: "storage_id", type: "int", nullable: false })
  @Index()
  storageId: number;

  @Column({ name: "retail_price", type: "int", nullable: false })
  retailPrice: number;

  @Column({ name: "unlocked_price", type: "int" })
  unlockedPrice: number;

  @Column({ name: "coupang_link", type: "text" })
  coupangLink: string;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;

  @ManyToOne(() => PhoneModel, (model) => model.devices)
  @JoinColumn({ name: "model_id" })
  model: PhoneModel;

  @ManyToOne(() => PhoneStorage, (storage) => storage.devices)
  @JoinColumn({ name: "storage_id" })
  storage: PhoneStorage;

  @OneToMany(() => Offer, (offer) => offer.device)
  offers: Offer[];
}
