import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostCategory } from "./postCategories.entity";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  category_id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @OneToMany(() => PostCategory, (postCategory) => postCategory.category)
  postCategories: PostCategory[];
}
