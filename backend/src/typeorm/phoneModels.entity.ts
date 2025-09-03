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
@Unique("uk_name_ko_manufacturer", ["name_ko", "manufacturerId"])
@Unique("uk_name_en_manufacturer", ["name_en", "manufacturerId"])
export class PhoneModel {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ name: "manufacturer_id", type: "int", nullable: false })
  @Index()
  manufacturerId: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  name_ko: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  @Index()
  name_en: string;

  @Column({
    name: "image_url",
    type: "varchar",
    length: 2048,
  })
  imageUrl: string;

  @Column({ name: "release_date", type: "date" })
  releaseDate: Date;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;

  @ManyToOne(() => PhoneManufacturer, (manufacturer) => manufacturer.models)
  @JoinColumn({ name: "manufacturer_id" })
  manufacturer: PhoneManufacturer;

  @OneToMany(() => PhoneDevice, (device) => device.model)
  devices: PhoneDevice[];
}
