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

@Entity("post_files")
export class PostFile {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  @Index()
  post_id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  file_name: string;

  @Column({ type: "text", nullable: false })
  file_url: string;

  @Column({ type: "int", nullable: false })
  file_size: number;

  @CreateDateColumn({ type: "datetime" })
  uploaded_at: Date;

  @ManyToOne(() => Post, (post) => post.files, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post;
}
