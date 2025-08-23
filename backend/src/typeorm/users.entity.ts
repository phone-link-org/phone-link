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

  @Column({ type: "varchar", length: 255, nullable: true })
  password?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "varchar", length: 50, unique: true, nullable: true })
  nickname?: string;

  @Column({ type: "varchar", length: 2048, nullable: true })
  profile_image_url?: string;

  @Column({ type: "enum", enum: ["M", "F"], nullable: true })
  gender?: "M" | "F";

  @Column({ type: "year", nullable: true })
  birth_year?: number; // ex. '1998'

  @Column({ type: "varchar", length: 5, nullable: true })
  birthday?: string; // ex. '03-09'

  @Column({ type: "varchar", length: 10, nullable: true })
  age_range?: string; // ex. '20-29'

  @Column({ type: "varchar", length: 20, unique: true, nullable: true })
  phone_number?: string;

  @Column({ type: "varchar", length: 10, nullable: true, comment: "우편번호" })
  postal_code?: string;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
    comment: "주소: 시/도",
  })
  sido?: string;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
    comment: "주소: 시/군/구",
  })
  sigungu?: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    comment: "기본 주소 (도로명 또는 지번)",
  })
  address?: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    comment: "상세 주소 (아파트 동, 호수 등)",
  })
  address_detail?: string;

  @Column({
    type: "enum",
    enum: ["user", "seller", "admin"],
    nullable: false,
    default: "user",
  })
  role: "user" | "seller" | "admin";

  @Column({
    type: "enum",
    enum: ["active", "suspended", "withdrawn"], // active: 활성, suspended: 정지, withdrawn: 탈퇴
    nullable: false,
    default: "active",
  })
  status: "active" | "suspended" | "withdrawn";

  @Column({ type: "timestamp", nullable: true })
  last_login_at?: Date; // 마지막 로그인 시간

  @CreateDateColumn()
  created_at: Date; // 가입 일시

  @UpdateDateColumn()
  updated_at: Date; // 마지막 정보 수정 일시

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date; // 탈퇴 일시 (NULL이면 탈퇴 안함)

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
