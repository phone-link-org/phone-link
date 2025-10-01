import type { StoreDto, SellerDto } from "./types";
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
  lastLoginType: string;
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

export interface UserSuspensionDto {
  id: number;

  // @IsNumber()
  // @IsNotEmpty({ message: "정지시킬 사용자의 ID는 필수입니다." })
  userId: number;

  // @IsString({ message: "정지 사유는 문자열이어야 합니다." })
  reason: string;

  // @Type(() => Date) // 들어오는 값이 문자열일 경우 Date 객체로 변환
  // @IsDate({ message: "정지 종료일은 유효한 날짜 형식이어야 합니다." })
  // @MinDate(new Date(), { message: "정지 종료일은 현재 시간 이후여야 합니다." })
  // @IsNotEmpty({ message: "정지 종료일은 필수입니다." })
  suspendedUntil: Date;

  suspendedById: number;
  createdAt: Date;
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
> & {
  storeId?: StoreDto["id"];
};

//Pick은 특정 타입에서 특정 키를 선택한 타입을 생성하는 타입
export type LoginFormData = Pick<Required<UserDto>, "email" | "password">;

export type UserAuthData = Pick<
  UserDto,
  "id" | "nickname" | "role" | "profileImageUrl"
> & {
  storeId?: StoreDto["id"];
};

export type StoreStaffData = {
  userId: UserDto["id"];
  email: UserDto["email"];
  name: UserDto["name"];
  nickname?: UserDto["nickname"];
  profileImageUrl?: UserDto["profileImageUrl"];
  phoneNumber?: UserDto["phoneNumber"];
  storeStatus: SellerDto["status"];
  systemStatus: UserDto["status"];
};

// [ 관리자 페이지 > 회원관리 ] 사용자 목록 조회용
export type UserSimpleDto = Pick<
  UserDto,
  "id" | "profileImageUrl" | "nickname" | "role" | "status"
>;

// [ 관리자 페이지 > 회원관리 > 모달 ] 사용자 상세 조회용
export type UserDetailDto = Pick<
  UserDto,
  | "id"
  | "profileImageUrl"
  | "nickname"
  | "name"
  | "email"
  | "phoneNumber"
  | "role"
  | "status"
  | "lastLoginAt"
  | "deletedAt"
  | "createdAt"
> &
  Pick<UserSuspensionDto, "reason" | "suspendedById"> & {
    suspendedUntil?: UserSuspensionDto["suspendedUntil"];
    storeId?: StoreDto["id"];
    storeThumbnailUrl: StoreDto["thumbnailUrl"];
    storeName: StoreDto["name"];
    providers: string[];
    suspendedAt?: UserSuspensionDto["createdAt"];
    sellerStatus?: "ACTIVE" | "INACTIVE" | "PENDING" | "REJECTED";
  };
