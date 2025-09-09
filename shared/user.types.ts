import type { StoreDto } from "./store.types";
import type { Role, SsoProvider } from "./constants";

export interface UserDto {
  readonly id: number;
  email: string;
  password?: string;
  name: string;
  nickname?: string;
  profileImageUrl?: string;
  gender?: "M" | "F";
  birthYear?: number;
  birthday?: string;
  ageRange?: string;
  phoneNumber?: string;
  postalCode?: string;
  sido?: string;
  sigungu?: string;
  address?: string;
  addressDetail?: string;
  role: Role;
  status: "ACTIVE" | "SUSPENDED" | "WITHDRAWN";
  readonly lastLoginAt?: Date;
  readonly deletedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export interface SocialAccountDto {
  readonly id: number;
  readonly userId: UserDto["id"];
  provider: SsoProvider;
  providerUserId: string;
  accessToken?: string;
  refreshToken?: string;
  readonly createdAt: Date;
}

//Omit은 특정 타입에서 특정 키를 제외한 타입을 생성하는 타입
export type SignupFormData = Omit<
  UserDto,
  | "id"
  | "nickname"
  | "birthYear"
  | "profileImageUrl"
  | "ageRange"
  | "status"
  | "lastLoginAt"
  | "deletedAt"
  | "createdAt"
  | "updatedAt"
>;

export type UserUpdateData = Pick<
  UserDto,
  | "id"
  | "nickname"
  | "password"
  | "profileImageUrl"
  | "address"
  | "addressDetail"
  | "postalCode"
  | "sido"
  | "sigungu"
  | "role"
>;

//Pick은 특정 타입에서 특정 키를 선택한 타입을 생성하는 타입
export type LoginFormData = Pick<Required<UserDto>, "email" | "password">;

export type UserAuthData = Pick<UserDto, "id" | "nickname" | "role"> & {
  storeId?: StoreDto["id"];
};
