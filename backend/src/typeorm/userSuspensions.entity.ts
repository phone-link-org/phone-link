import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { User } from "./users.entity"; // users.entity.ts 파일의 경로에 맞게 수정해주세요.

@Entity("user_suspensions")
export class UserSuspension {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ name: "user_id", type: "bigint", nullable: false })
  @Index("idx_user_id") // user_id 컬럼에 인덱스 추가
  userId: number;

  @Column({ type: "text", nullable: true })
  reason: string;

  @Column({ name: "suspended_until", type: "datetime", nullable: false })
  @Index("idx_suspended_until") // suspended_until 컬럼에 인덱스 추가
  suspendedUntil: Date;

  @Column({ name: "suspended_by", type: "bigint", nullable: true })
  suspendedById: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  // --- 관계 설정 ---

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "suspended_by" })
  suspendedByAdmin: User;
}
