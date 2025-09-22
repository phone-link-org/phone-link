import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from "typeorm";
import { PhoneDevice } from "./phoneDevices.entity";

@Entity("phone_storages")
@Unique("uk_storage", ["storage"])
export class PhoneStorage {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id: number;

  @Column({ type: "varchar", length: 10, nullable: false })
  storage: string;

  @OneToMany(() => PhoneDevice, (device) => device.storage)
  devices: PhoneDevice[];
}
