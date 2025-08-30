import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { PhoneManufacturer } from "./phoneManufacturers.entity";
import { PhoneDevice } from "./phoneDevices.entity";

@Entity("phone_models")
@Unique("uk_name_ko_manufacturer", ["name_ko", "manufacturer_id"])
@Unique("uk_name_en_manufacturer", ["name_en", "manufacturer_id"])
export class PhoneModel {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "int", nullable: false })
  @Index()
  manufacturer_id: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  name_ko: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  @Index()
  name_en: string;

  @Column({
    type: "varchar",
    length: 2048,
  })
  image_url: string;

  @Column({ type: "date" })
  release_date: Date;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @ManyToOne(() => PhoneManufacturer, (manufacturer) => manufacturer.models)
  @JoinColumn({ name: "manufacturer_id" })
  manufacturer: PhoneManufacturer;

  @OneToMany(() => PhoneDevice, (device) => device.model)
  devices: PhoneDevice[];
}
