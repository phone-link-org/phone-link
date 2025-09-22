import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Store } from "./stores.entity";

@Entity("regions")
export class Region {
  @PrimaryColumn({ type: "varchar", length: 10 })
  code: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  name: string;

  @Column({
    name: "is_active",
    type: "boolean",
    nullable: false,
    default: true,
  })
  isActive: boolean;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  longitude: number;

  @Column({ name: "last_synced_at", type: "datetime" })
  lastSyncedAt: Date;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;

  @OneToMany(() => Store, (store) => store.region)
  stores: Store[];
}
