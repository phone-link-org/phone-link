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
import { UserFavorite } from "./userFavorites.entity";

@Entity("stores")
export class Store {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column({ name: "region_code", type: "varchar", length: 10, nullable: false })
  @Index()
  regionCode: string;

  @Column({ type: "varchar", length: 255 })
  address: string;

  @Column({ name: "address_detail", type: "varchar", length: 255 })
  addressDetail: string;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: "varchar", length: 20 })
  contact: string;

  @Column({ name: "thumbnail_url", type: "varchar", length: 2048 })
  thumbnailUrl: string;

  @Column({ type: "varchar", length: 2048 })
  link_1: string;

  @Column({ type: "varchar", length: 2048 })
  link_2: string;

  @Column({ name: "owner_name", type: "varchar", length: 50 })
  ownerName: string;

  @Column({
    name: "is_featured",
    type: "boolean",
    nullable: false,
    default: false,
  })
  isFeatured: boolean;

  @Column({
    type: "enum",
    enum: ["OPEN", "CLOSED"],
    nullable: false,
    default: "OPEN",
  })
  status: "OPEN" | "CLOSED";

  @Column({
    name: "approval_status",
    type: "enum",
    enum: ["PENDING", "APPROVED", "REJECTED"],
    nullable: false,
    default: "PENDING",
  })
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";

  @Column({ name: "created_by", type: "bigint" })
  createdBy: number;

  @Column({ name: "updated_by", type: "bigint" })
  updatedBy: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;

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

  @OneToMany(() => UserFavorite, (favorite) => favorite.storeId)
  favoritedBy: UserFavorite[];
}
