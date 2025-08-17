import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PhoneDevice } from "./phoneDevices.entity";

@Entity("phone_storages")
export class PhoneStorage {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id: number;

  @Column({ type: "varchar", length: 10, unique: true })
  storage: string;

  @OneToMany(() => PhoneDevice, (device) => device.storage)
  devices: PhoneDevice[];
}
