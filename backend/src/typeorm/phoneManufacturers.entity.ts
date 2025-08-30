import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
} from "typeorm";
import { PhoneModel } from "./phoneModels.entity";

@Entity("phone_manufacturers")
@Unique("uk_name_ko", ["name_ko"])
@Unique("uk_name_en", ["name_en"])
export class PhoneManufacturer {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id: number;

  @Column({ type: "varchar", length: 50, nullable: false })
  name_ko: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  name_en: string;

  @OneToMany(() => PhoneModel, (model) => model.manufacturer)
  models: PhoneModel[];
}
