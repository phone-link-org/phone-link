import { Entity, PrimaryColumn, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { Post } from "./posts.entity";
import { User } from "./users.entity";

@Entity("post_likes")
export class PostLike {
  @PrimaryColumn({ name: "user_id", type: "bigint", nullable: false })
  userId: number;

  @PrimaryColumn({ name: "post_id", type: "bigint", nullable: false })
  postId: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.postLikes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post;
}
