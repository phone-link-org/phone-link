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

  @Column({ name: "post_id", type: "bigint", nullable: false })
  @Index()
  postId: number;

  @Column({ name: "user_id", type: "bigint", nullable: false })
  @Index()
  userId: number;

  @Column({ type: "text", nullable: false })
  content: string;

  @Column({
    name: "is_deleted",
    type: "boolean",
    nullable: false,
    default: false,
  })
  isDeleted: boolean;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: "user_id" })
  user: User;
}
