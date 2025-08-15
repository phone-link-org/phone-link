import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import { Region } from "./regions.entity";
import { Addon } from "./addons.entity";
import { ReqPlan } from "./reqPlans.entity";
import { Seller } from "./sellers.entity";
import { Offer } from "./offers.entity";

@Entity("stores")
export class Store {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  store_id: number;

  @Column({ type: "int" })
  @Index()
  region_id: number;

  @Column({ type: "varchar", length: 255 })
  store_name: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  contact: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  owner: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Region, (region) => region.stores)
  @JoinColumn({ name: "region_id" })
  region: Region;

  @OneToMany(() => Addon, (addon) => addon.store)
  addons: Addon[];

  @OneToMany(() => ReqPlan, (reqPlan) => reqPlan.store)
  reqPlans: ReqPlan[];

  @OneToMany(() => Seller, (seller) => seller.store)
  sellers: Seller[];

  @OneToMany(() => Offer, (offer) => offer.store)
  offers: Offer[];
}
