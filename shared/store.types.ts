import type { UserDto, RegionDto } from "./types";

export interface StoreDto {
  readonly id: number;
  name: string;
  description?: string;
  region_code: RegionDto["code"];
  address: string;
  address_detail: string;
  latitude?: number;
  longitude?: number;
  contact: string;
  thumbnail_url?: string;
  link_1?: string;
  link_2?: string;
  owner_name?: string;
  is_featured: boolean;
  status: "OPEN" | "CLOSED";
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  created_by?: UserDto["id"];
  updated_by?: UserDto["id"];
  readonly created_at: Date;
  readonly updated_at?: Date;
}

// 매장 등록 시 사용할 필드만 선택
export type StoreRegisterFormData = Pick<
  StoreDto,
  | "name"
  | "description"
  | "region_code"
  | "address"
  | "address_detail"
  | "contact"
  | "thumbnail_url"
  | "link_1"
  | "link_2"
  | "owner_name"
  | "approval_status"
  | "created_by"
>;

// 승인 대기 매장 목록 조회용 DTO
export type PendingStoreDto = Pick<
  StoreDto,
  "id" | "name" | "region_code" | "contact" | "created_by" | "created_at"
> & {
  region_name: RegionDto["name"];
  user_email: UserDto["email"];
};
