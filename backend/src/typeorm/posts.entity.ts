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
import { PostLike } from "./postLikes.entity";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ name: "user_id", type: "bigint", nullable: false })
  @Index("idx_posts_user_id")
  userId: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  title: string;

  @Column({ name: "thumbnail_url", type: "varchar", length: 2048 })
  thumbnailUrl: string;

  @Column({ type: "text", nullable: false })
  content: string;

  @Column({ name: "view_count", type: "int", nullable: false, default: 0 })
  viewCount: number;

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
  @Index("idx_posts_created_at")
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;

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

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];
}
