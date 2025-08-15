import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from "typeorm";
import { PhoneManufacturer } from "./phoneManufacturers.entity";
import { PhoneDevice } from "./phoneDevices.entity";

@Entity("phone_models")
export class PhoneModel {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "int" })
  @Index()
  manufacturer_id: number;

  @Column({ type: "varchar", length: 50 })
  name_ko: string;

  @Column({ type: "varchar", length: 50 })
  @Index()
  name_en: string;

  @Column({ type: "varchar", length: 255 })
  image_url: string;

  @ManyToOne(() => PhoneManufacturer, (manufacturer) => manufacturer.models)
  @JoinColumn({ name: "manufacturer_id" })
  manufacturer: PhoneManufacturer;

  @OneToMany(() => PhoneDevice, (device) => device.model)
  devices: PhoneDevice[];
}
