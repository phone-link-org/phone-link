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
  image_id: number;

  @Column({ type: "bigint" })
  @Index()
  post_id: number;

  @Column({ type: "text" })
  image_url: string;

  @CreateDateColumn()
  uploaded_at: Date;

  @ManyToOne(() => Post, (post) => post.images)
  @JoinColumn({ name: "post_id" })
  post: Post;
}
