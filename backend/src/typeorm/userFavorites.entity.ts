import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Unique, Column } from "typeorm";

/**
 * 사용자가 즐겨찾기한 매장 정보를 저장하는 관계 엔티티
 */
@Entity({ name: "user_favorites" })
@Unique("uq_user_store", ["userId", "storeId"]) // 동일 유저가 동일 매장을 중복 즐겨찾기 불가
export class UserFavorite {
  /** 즐겨찾기 고유 ID (PK) */
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id", type: "bigint", nullable: false })
  userId: number;

  @Column({ name: "store_id", type: "bigint", nullable: false })
  storeId: number;

  /** 즐겨찾기 등록 일시 */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
