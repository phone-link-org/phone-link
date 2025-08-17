import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Post } from "./posts.entity";
import { Category } from "./categories.entity";

@Entity("post_categories")
export class PostCategory {
  @PrimaryColumn({ type: "bigint" })
  post_id: number;

  @PrimaryColumn({ type: "bigint" })
  category_id: number;

  @ManyToOne(() => Post, (post) => post.postCategories)
  @JoinColumn({ name: "post_id" })
  post: Post;

  @ManyToOne(() => Category, (category) => category.postCategories)
  @JoinColumn({ name: "category_id" })
  category: Category;
}
