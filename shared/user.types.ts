import type { StoreDto } from "./store.types";

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
  role: "USER" | "SELLER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "WITHDRAWN";
  readonly lastLoginAt?: Date;
  readonly deletedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export interface SocialAccountDto {
  readonly id: number;
  readonly userId: UserDto["id"];
  provider: "kakao" | "naver" | "google" | "apple";
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

//Pick은 특정 타입에서 특정 키를 선택한 타입을 생성하는 타입
export type LoginFormData = Pick<Required<UserDto>, "email" | "password">;

export type UserAuthData = Pick<UserDto, "id" | "nickname" | "role"> & {
  storeId?: StoreDto["id"];
};
