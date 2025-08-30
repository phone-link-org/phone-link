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
@Unique("uk_provider_user", ["provider", "provider_user_id"])
@Index("idx_user_id", ["user_id"])
export class SocialAccount {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  user_id: number;

  @Column({ type: "varchar", length: 20, nullable: false })
  provider: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  provider_user_id: string;

  @Column({ type: "varchar", length: 1024 })
  access_token?: string;

  @Column({ type: "varchar", length: 1024 })
  refresh_token?: string;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.social_accounts)
  @JoinColumn({ name: "user_id" })
  user: User;
}
