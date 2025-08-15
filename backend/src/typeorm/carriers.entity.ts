import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Addon } from "./addons.entity";
import { ReqPlan } from "./reqPlans.entity";
import { Offer } from "./offers.entity";

@Entity("carriers")
export class Carrier {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  carrier_id: number;

  @Column({ type: "varchar", length: 50 })
  carrier_name: string;

  @OneToMany(() => Addon, (addon) => addon.carrier)
  addons: Addon[];

  @OneToMany(() => ReqPlan, (reqPlan) => reqPlan.carrier)
  reqPlans: ReqPlan[];

  @OneToMany(() => Offer, (offer) => offer.carrier)
  offers: Offer[];
}
