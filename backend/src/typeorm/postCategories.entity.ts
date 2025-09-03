import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Post } from "./posts.entity";
import { Category } from "./categories.entity";

@Entity("post_categories")
export class PostCategory {
  @PrimaryColumn({ name: "post_id", type: "bigint", nullable: false })
  postId: number;

  @PrimaryColumn({ name: "category_id", type: "bigint", nullable: false })
  categoryId: number;

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
