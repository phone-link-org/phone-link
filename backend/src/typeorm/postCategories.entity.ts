import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Post } from "./posts.entity";
import { Category } from "./categories.entity";

@Entity("post_categories")
export class PostCategory {
  @PrimaryColumn({ type: "bigint", nullable: false })
  post_id: number;

  @PrimaryColumn({ type: "bigint", nullable: false })
  category_id: number;

  @ManyToOne(() => Post, (post) => post.postCategories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post;

  @ManyToOne(() => Category, (category) => category.postCategories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "category_id" })
  category: Category;
}
