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
  file_id: number;

  @Column({ type: "bigint" })
  @Index()
  post_id: number;

  @Column({ type: "varchar", length: 255 })
  file_name: string;

  @Column({ type: "text" })
  file_url: string;

  @Column({ type: "int" })
  file_size: number;

  @CreateDateColumn()
  uploaded_at: Date;

  @ManyToOne(() => Post, (post) => post.files)
  @JoinColumn({ name: "post_id" })
  post: Post;
}
