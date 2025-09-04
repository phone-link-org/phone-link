import type { StoreDto, UserDto } from "./types";

export interface SellerDto {
  readonly id?: number;
  userId: UserDto["id"];
  storeId: StoreDto["id"];
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "REJECTED"; // 순서대로: 재직, 퇴사, 승인대기, 승인거절
  readonly createdAt?: Date;
}
