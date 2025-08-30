import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Post } from "./posts.entity";
import { User } from "./users.entity";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  @Index()
  post_id: number;

  @Column({ type: "bigint", nullable: false })
  @Index()
  user_id: number;

  @Column({ type: "text", nullable: false })
  content: string;

  @Column({ type: "boolean", nullable: false, default: false })
  is_deleted: boolean;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: "user_id" })
  user: User;
}
