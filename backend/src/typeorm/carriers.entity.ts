import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Addon } from "./addons.entity";
import { ReqPlan } from "./reqPlans.entity";
import { Offer } from "./offers.entity";

@Entity("carriers")
@Unique("uk_name", ["name"])
export class Carrier {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id: number;

  @Column({ type: "varchar", length: 50, nullable: false })
  name: string;

  @Column({ type: "varchar", length: 2048 })
  image_url: string;

  @OneToMany(() => Addon, (addon) => addon.carrier)
  addons: Addon[];

  @OneToMany(() => ReqPlan, (reqPlan) => reqPlan.carrier)
  reqPlans: ReqPlan[];

  @OneToMany(() => Offer, (offer) => offer.carrier)
  offers: Offer[];
}
