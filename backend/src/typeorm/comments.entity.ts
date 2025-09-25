import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Post } from "./posts.entity";
import { User } from "./users.entity";
import { CommentLike } from "./commentLikes.entity";

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

  @Column({ name: "parent_id", type: "bigint", nullable: true })
  @Index()
  parentId?: number;

  @Column({ type: "text", nullable: false })
  content: string;

  @Column({ name: "like_count", type: "int", nullable: false, default: 0 })
  likeCount: number;

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

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parent_id" })
  parent?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @OneToMany(() => CommentLike, (like) => like.comment)
  likes: CommentLike[];
}
