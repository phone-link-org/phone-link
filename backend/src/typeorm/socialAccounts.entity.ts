import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./users.entity";

@Entity("social_accounts")
@Unique(["provider", "provider_user_id"])
export class SocialAccount {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  user_id: number;

  @Column({ type: "varchar", length: 20, nullable: false })
  provider: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  provider_user_id: string;

  @Column({ type: "varchar", length: 1024, nullable: true })
  access_token?: string;

  @Column({ type: "varchar", length: 1024, nullable: true })
  refresh_token?: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.social_accounts)
  @JoinColumn({ name: "user_id" })
  user: User;
}
