import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from "typeorm";
import { User } from "./users.entity";
import { Store } from "./stores.entity";

@Entity("user_favorites")
@Unique("uq_user_store", ["userId", "storeId"])
export class UserFavorites {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ name: "user_id", type: "bigint", nullable: false })
  userId: number;

  @Column({ name: "store_id", type: "bigint", nullable: false })
  storeId: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Store, (store) => store.favorites, { onDelete: "CASCADE" })
  @JoinColumn({ name: "store_id" })
  store: Store;
}
