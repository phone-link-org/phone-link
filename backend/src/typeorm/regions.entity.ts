import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Store } from "./stores.entity";

@Entity("regions")
export class Region {
  @PrimaryColumn({ type: "varchar", length: 10 })
  code: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  name: string;

  @Column({ type: "boolean", nullable: false, default: true })
  is_active: boolean;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: "datetime" })
  last_synced_at: Date;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @OneToMany(() => Store, (store) => store.region)
  stores: Store[];
}
