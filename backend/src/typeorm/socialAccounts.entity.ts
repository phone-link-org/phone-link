import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { User } from "./users.entity";

@Entity("social_accounts")
@Unique("uk_provider_user", ["provider", "providerUserId"])
@Index("idx_user_id", ["userId"])
export class SocialAccount {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ name: "user_id", type: "bigint", nullable: false })
  userId: number;

  @Column({ type: "varchar", length: 20, nullable: false })
  provider: string;

  @Column({
    name: "provider_user_id",
    type: "varchar",
    length: 255,
    nullable: false,
  })
  providerUserId: string;

  @Column({ name: "access_token", type: "varchar", length: 1024 })
  accessToken: string | null;

  @Column({ name: "refresh_token", type: "varchar", length: 1024 })
  refreshToken: string | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.socialAccounts)
  @JoinColumn({ name: "user_id" })
  user: User;
}
