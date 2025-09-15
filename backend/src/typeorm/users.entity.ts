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
import { ROLES, Role } from "../../../shared/constants";
import { UserFavorite } from "./userFavorites.entity";

@Entity("users")
@Index("idx_status", ["status"])
@Index("idx_deleted_at", ["deletedAt"])
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

  @Column({ name: "profile_image_url", type: "varchar", length: 2048 })
  profileImageUrl?: string;

  @Column({ type: "enum", enum: ["M", "F"] })
  gender?: "M" | "F";

  @Column({ name: "birth_year", type: "year" })
  birthYear?: number;

  @Column({ type: "varchar", length: 5 })
  birthday?: string;

  @Column({ name: "age_range", type: "varchar", length: 10 })
  ageRange?: string;

  @Column({ name: "phone_number", type: "varchar", length: 20, unique: true })
  phoneNumber?: string;

  @Column({ name: "postal_code", type: "varchar", length: 10 })
  postalCode?: string;

  @Column({ type: "varchar", length: 50 })
  sido?: string;

  @Column({ type: "varchar", length: 50 })
  sigungu?: string;

  @Column({ type: "varchar", length: 255 })
  address?: string;

  @Column({ name: "address_detail", type: "varchar", length: 255 })
  addressDetail?: string;

  @Column({
    type: "enum",
    enum: [ROLES.USER, ROLES.SELLER, ROLES.SELLER],
    nullable: false,
    default: ROLES.USER,
  })
  role: Role;

  //ACTIVE: 활성화, SUSPENDED: 정지, WITHDRAWN: 탈퇴
  @Column({
    type: "enum",
    enum: ["ACTIVE", "SUSPENDED", "WITHDRAWN"],
    nullable: false,
    default: "ACTIVE",
  })
  status: "ACTIVE" | "SUSPENDED" | "WITHDRAWN";

  @Column({ name: "last_login_at", type: "datetime" })
  lastLoginAt?: Date;

  @Column({ name: "last_login_type", type: "varchar", length: 100 })
  lastLoginType: string;

  @DeleteDateColumn({ name: "deleted_at", type: "datetime" })
  deletedAt?: Date;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;

  // --- Relationships ---
  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  socialAccounts: SocialAccount[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Seller, (seller) => seller.user)
  sellers: Seller[];

  /** 사용자가 즐겨찾기한 매장 목록 */
  @OneToMany(() => UserFavorite, (favorite) => favorite.userId)
  favorites: UserFavorite[];
}
