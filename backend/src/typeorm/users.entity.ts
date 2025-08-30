import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";
import { Comment } from "./comments.entity";
import { Post } from "./posts.entity";
import { Seller } from "./sellers.entity";
import { SocialAccount } from "./socialAccounts.entity";

@Entity("users")
@Index("idx_status", ["status"])
@Index("idx_deleted_at", ["deleted_at"])
export class User {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "varchar", length: 50, unique: true })
  nickname?: string;

  @Column({ type: "varchar", length: 2048 })
  profile_image_url?: string;

  @Column({ type: "enum", enum: ["M", "F"] })
  gender?: "M" | "F";

  @Column({ type: "year" })
  birth_year?: number;

  @Column({ type: "varchar", length: 5 })
  birthday?: string;

  @Column({ type: "varchar", length: 10 })
  age_range?: string;

  @Column({ type: "varchar", length: 20, unique: true })
  phone_number?: string;

  @Column({ type: "varchar", length: 10 })
  postal_code?: string;

  @Column({ type: "varchar", length: 50 })
  sido?: string;

  @Column({ type: "varchar", length: 50 })
  sigungu?: string;

  @Column({ type: "varchar", length: 255 })
  address?: string;

  @Column({ type: "varchar", length: 255 })
  address_detail?: string;

  @Column({
    type: "enum",
    enum: ["USER", "SELLER", "ADMIN"],
    nullable: false,
    default: "USER",
  })
  role: "USER" | "SELLER" | "ADMIN";

  @Column({
    type: "enum",
    enum: ["ACTIVE", "SUSPENDED", "WITHDRAWN"],
    nullable: false,
    default: "ACTIVE",
  })
  status: "ACTIVE" | "SUSPENDED" | "WITHDRAWN";

  @Column({ type: "datetime" })
  last_login_at?: Date;

  @DeleteDateColumn({ type: "datetime" })
  deleted_at?: Date;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  // --- Relationships ---
  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  social_accounts: SocialAccount[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Seller, (seller) => seller.user)
  sellers: Seller[];
}
