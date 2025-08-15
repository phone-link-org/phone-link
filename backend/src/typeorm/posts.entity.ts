import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './users.entity';
import { Comment } from './comments.entity';
import { PostFile } from './postFiles.entity';
import { PostImage } from './postImages.entity';
import { PostCategory } from './postCategories.entity';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    post_id: number;

    @Column({ type: 'bigint' })
    @Index()
    user_id: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'int', default: 0 })
    view_count: number;

    @Column({ type: 'tinyint', default: 0 })
    is_deleted: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn({ nullable: true })
    updated_at: Date;

    @ManyToOne(() => User, user => user.posts)
    user: User;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @OneToMany(() => PostFile, file => file.post)
    files: PostFile[];

    @OneToMany(() => PostImage, image => image.post)
    images: PostImage[];

    @OneToMany(() => PostCategory, postCategory => postCategory.post)
    postCategories: PostCategory[];
}
