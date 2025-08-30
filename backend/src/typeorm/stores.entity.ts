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
import { User } from "./users.entity";

@Entity("stores")
export class Store {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "varchar", length: 10, nullable: false })
  @Index()
  region_code: string;

  @Column({ type: "varchar", length: 255 })
  address: string;

  @Column({ type: "varchar", length: 255 })
  address_detail: string;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: "varchar", length: 20 })
  contact: string;

  @Column({ type: "varchar", length: 2048 })
  thumbnail_url: string;

  @Column({ type: "varchar", length: 2048 })
  link_1: string;

  @Column({ type: "varchar", length: 2048 })
  link_2: string;

  @Column({ type: "varchar", length: 50 })
  owner_name: string;

  @Column({ type: "boolean", nullable: false, default: false })
  is_featured: boolean;

  @Column({
    type: "enum",
    enum: ["OPEN", "CLOSED"],
    nullable: false,
    default: "OPEN",
  })
  status: "OPEN" | "CLOSED";

  @Column({
    type: "enum",
    enum: ["PENDING", "APPROVED", "REJECTED"],
    nullable: false,
    default: "PENDING",
  })
  approval_status: "PENDING" | "APPROVED" | "REJECTED";

  @Column({ type: "bigint" })
  created_by: number;

  @Column({ type: "bigint" })
  updated_by: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @ManyToOne(() => Region, (region) => region.stores)
  @JoinColumn({ name: "region_code" })
  region: Region;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdByUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updated_by" })
  updatedByUser: User;

  @OneToMany(() => Addon, (addon) => addon.store)
  addons: Addon[];

  @OneToMany(() => ReqPlan, (reqPlan) => reqPlan.store)
  reqPlans: ReqPlan[];

  @OneToMany(() => Seller, (seller) => seller.store)
  sellers: Seller[];

  @OneToMany(() => Offer, (offer) => offer.store)
  offers: Offer[];
}
