import { StoreDto } from "./store.types";
import { UserDto } from "./user.types";

export interface UserFavoriteDto {
  id: number;
  user: UserDto;
  store: StoreDto;
}
