import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { User } from "./users.entity";
import { Store } from "./stores.entity";

@Entity("sellers")
@Unique("uk_user_store", ["user_id", "store_id"])
export class Seller {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  @Index()
  user_id: number;

  @Column({ type: "bigint", nullable: false })
  @Index()
  store_id: number;

  @Column({
    type: "enum",
    enum: ["ACTIVE", "INACTIVE", "PENDING", "REJECTED"],
    nullable: false,
    default: "ACTIVE",
    comment:
      "ACTIVE: 재직, INACTIVE: 퇴사, PENDING: 승인대기, REJECTED: 승인거절",
  })
  status: "ACTIVE" | "INACTIVE";

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.sellers)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Store, (store) => store.sellers)
  @JoinColumn({ name: "store_id" })
  store: Store;
}
