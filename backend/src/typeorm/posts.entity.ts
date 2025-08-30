import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import { User } from "./users.entity";
import { Comment } from "./comments.entity";
import { PostFile } from "./postFiles.entity";
import { PostImage } from "./postImages.entity";
import { PostCategory } from "./postCategories.entity";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "bigint", nullable: false })
  @Index()
  user_id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  title: string;

  @Column({ type: "text", nullable: false })
  content: string;

  @Column({ type: "int", nullable: false, default: 0 })
  view_count: number;

  @Column({ type: "boolean", nullable: false, default: false })
  is_deleted: boolean;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostFile, (file) => file.post)
  files: PostFile[];

  @OneToMany(() => PostImage, (image) => image.post)
  images: PostImage[];

  @OneToMany(() => PostCategory, (postCategory) => postCategory.post)
  postCategories: PostCategory[];
}
