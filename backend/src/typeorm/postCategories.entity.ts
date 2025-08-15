import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Post } from './posts.entity';
import { Category } from './categories.entity';

@Entity('post_categories')
export class PostCategory {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    post_id: number;

    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    category_id: number;

    @ManyToOne(() => Post, post => post.postCategories)
    post: Post;

    @ManyToOne(() => Category, category => category.postCategories)
    category: Category;
}
