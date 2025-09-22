import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { PostCategory } from "./postCategories.entity";

@Entity("categories")
@Unique("uk_name", ["name"])
export class Category {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  name: string;

  @Column({ type: "text" })
  description: string;

  @OneToMany(() => PostCategory, (postCategory) => postCategory.category)
  postCategories: PostCategory[];
}
