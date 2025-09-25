import { Entity, PrimaryColumn, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { Comment } from "./comments.entity";
import { User } from "./users.entity";

@Entity("comment_likes")
export class CommentLike {
  @PrimaryColumn({ name: "user_id", type: "bigint", nullable: false })
  userId: number;

  @PrimaryColumn({ name: "comment_id", type: "bigint", nullable: false })
  commentId: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.commentLikes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.likes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "comment_id" })
  comment: Comment;
}
