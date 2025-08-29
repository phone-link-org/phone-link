import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { Region } from "./regions.entity";
import { Addon } from "./addons.entity";
import { ReqPlan } from "./reqPlans.entity";
import { Seller } from "./sellers.entity";
import { Offer } from "./offers.entity";

@Entity("stores")
export class Store {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 10 })
  @Index()
  region_code: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address_detail: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: "varchar", length: 20, nullable: true })
  contact: string;

  @Column({ type: "varchar", length: 2048, nullable: true })
  thumbnail_url: string;

  @Column({ type: "varchar", length: 2048, nullable: true })
  link_1: string;

  @Column({ type: "varchar", length: 2048, nullable: true })
  link_2: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  owner_name: string;

  @Column({ type: "boolean", default: false })
  is_featured: boolean;

  @Column({ type: "enum", enum: ["OPEN", "CLOSED"], default: "OPEN" })
  status: "OPEN" | "CLOSED";

  @Column({
    type: "enum",
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  })
  approval_status: "PENDING" | "APPROVED" | "REJECTED";

  @Column({ type: "bigint" })
  created_by: number;

  @Column({ type: "bigint", nullable: true })
  updated_by: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @ManyToOne(() => Region, (region) => region.stores)
  @JoinColumn({ name: "region_code" })
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
