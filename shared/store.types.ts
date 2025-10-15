import type { UserDto, RegionDto } from "./types";

export interface StoreDto {
  readonly id: number;
  name: string;
  description?: string;
  regionCode: RegionDto["code"];
  address: string;
  addressDetail: string;
  latitude?: number;
  longitude?: number;
  contact: string;
  thumbnailUrl?: string;
  link_1?: string;
  link_2?: string;
  ownerName?: string | null;
  isFeatured: boolean;
  status: "OPEN" | "CLOSED";
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdBy?: UserDto["id"];
  updatedBy?: UserDto["id"];
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

// 매장 등록/수정 시 사용할 필드만 선택
export type StoreRegisterFormData = Pick<
  StoreDto,
  | "name"
  | "description"
  | "regionCode"
  | "address"
  | "addressDetail"
  | "contact"
  | "thumbnailUrl"
  | "link_1"
  | "link_2"
  | "ownerName"
  | "approvalStatus"
  | "createdBy"
>;

// 승인 대기 매장 목록 조회용 DTO
export type PendingStoreDto = Pick<
  StoreDto,
  "id" | "name" | "regionCode" | "contact" | "createdBy" | "createdAt"
> & {
  regionName: RegionDto["name"];
  userEmail: UserDto["email"];
};
