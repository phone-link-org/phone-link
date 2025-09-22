import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, JoinColumn } from "typeorm";
import { Post } from "./posts.entity";

@Entity("post_images")
export class PostImage {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ name: "post_id", type: "bigint", nullable: false })
  @Index()
  postId: number;

  @Column({ name: "image_url", type: "text", nullable: false })
  imageUrl: string;

  @CreateDateColumn({ name: "uploaded_at", type: "datetime" })
  uploadedAt: Date;

  @ManyToOne(() => Post, (post) => post.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post;
}
