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

  @Column({ name: "post_id", type: "bigint", nullable: false })
  @Index()
  postId: number;

  @Column({ name: "file_name", type: "varchar", length: 255, nullable: false })
  fileName: string;

  @Column({ name: "file_url", type: "text", nullable: false })
  fileUrl: string;

  @Column({ name: "file_size", type: "int", nullable: false })
  fileSize: number;

  @CreateDateColumn({ name: "uploaded_at", type: "datetime" })
  uploadedAt: Date;

  @ManyToOne(() => Post, (post) => post.files, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post;
}
