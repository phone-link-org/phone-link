import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import { Post } from "./posts.entity";

@Entity("post_images")
export class PostImage {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  @Index()
  post_id: number;

  @Column({ type: "text", nullable: false })
  image_url: string;

  @CreateDateColumn({ type: "datetime" })
  uploaded_at: Date;

  @ManyToOne(() => Post, (post) => post.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post;
}
