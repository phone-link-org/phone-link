import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { Comment } from "./comments.entity";
import { Post } from "./posts.entity";
import { Seller } from "./sellers.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  user_id: number;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  name: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone_number: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "enum", enum: ["male", "female"], nullable: true })
  gender: "male" | "female";

  @Column({
    type: "enum",
    enum: ["local", "google", "apple", "naver", "kakao"],
  })
  login_provider: "local" | "google" | "apple" | "naver" | "kakao";

  @Column({ type: "varchar", length: 255, nullable: true })
  provider_id: string;

  @Column({ type: "enum", enum: ["user", "seller", "admin"] })
  role: "user" | "seller" | "admin";

  @Column({ type: "varchar", length: 100, nullable: false })
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Seller, (seller) => seller.user)
  sellers: Seller[];
}
