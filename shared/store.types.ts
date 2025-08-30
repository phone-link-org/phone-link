import { UserDto, RegionDto } from "./types";

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

// 승인 대기 매장 목록 조회용 DTO
export type PendingStoreDto = Pick<
  StoreDto,
  "id" | "name" | "region_code" | "contact" | "created_by" | "created_at"
> & {
  region_name: RegionDto["name"];
  user_email: UserDto["email"];
};
