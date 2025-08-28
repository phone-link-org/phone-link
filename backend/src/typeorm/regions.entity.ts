import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Store } from "./stores.entity";

@Entity("regions", {
  comment: "전국 법정동 코드 정보 테이블",
})
export class Region {
  @PrimaryColumn({
    type: "varchar",
    length: 10,
    comment: "법정동 코드 (PK)",
  })
  code: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: false,
    comment: "법정동 전체 이름",
  })
  name: string;

  @Column({
    type: "boolean",
    nullable: false,
    default: true,
    comment: "사용 여부 (존재: TRUE, 폐지: FALSE)",
  })
  is_active: boolean;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 7,
    nullable: true,
    comment: "위도 (Geolocation)",
  })
  latitude: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 7,
    nullable: true,
    comment: "경도 (Geolocation)",
  })
  longitude: number;

  @Column({
    type: "timestamp",
    nullable: true,
    comment: "공공데이터 API 마지막 동기화 일시",
  })
  last_synced_at: Date;

  @CreateDateColumn({ type: "timestamp", comment: "데이터 생성 일시" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", comment: "데이터 수정 일시" })
  updated_at: Date;

  @OneToMany(() => Store, (store) => store.region)
  stores: Store[];
}
