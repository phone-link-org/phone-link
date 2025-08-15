import { Column, CreateDateColumn,  Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./posts.entity";
import { User } from "./users.entity";

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    comment_id: number;

    @Column({ type: 'bigint' })
    @Index()
    post_id: number;

    @Column({ type: 'bigint' })
    @Index()
    user_id: number;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn({ nullable: true })
    updated_at: Date;

    @Column({ type: 'tinyint', default: 0 })
    is_deleted: boolean;

    @ManyToOne(() => Post, post => post.comments)
    post: Post;

    @ManyToOne(() => User, user => user.comments)
    user: User;
}
