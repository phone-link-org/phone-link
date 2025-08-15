import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Store } from "./stores.entity";

@Entity("regions")
export class Region {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  region_id: number;

  @Column({ type: "int", nullable: true })
  parent_id: number;

  @Column({ type: "varchar", length: 50 })
  name: string;

  @ManyToOne(() => Region, (region) => region.children)
  @JoinColumn({ name: "parent_id" })
  parent: Region;

  @OneToMany(() => Region, (region) => region.parent)
  children: Region[];

  @OneToMany(() => Store, (store) => store.region)
  stores: Store[];
}
