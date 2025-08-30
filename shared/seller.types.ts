import { StoreDto, UserDto } from "./types";

export interface SellerDto {
  readonly id: number;
  user_id: UserDto["id"];
  store_id: StoreDto["id"];
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "REJECTED"; // 순서대로: 재직, 퇴사, 승인대기, 승인거절
  readonly created_at: Date;
}
