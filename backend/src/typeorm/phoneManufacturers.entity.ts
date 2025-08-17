import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PhoneModel } from "./phoneModels.entity";

@Entity("phone_manufacturers")
export class PhoneManufacturer {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id: number;

  @Column({ type: "varchar", length: 30 })
  name_ko: string;

  @Column({ type: "varchar", length: 30, unique: true })
  name_en: string;

  @OneToMany(() => PhoneModel, (model) => model.manufacturer)
  models: PhoneModel[];
}
