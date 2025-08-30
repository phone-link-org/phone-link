export interface UserDto {
  readonly id: number;
  email: string;
  password?: string;
  name: string;
  nickname?: string;
  profile_image_url?: string;
  gender?: "M" | "F";
  birth_year?: number;
  birthday?: string;
  age_range?: string;
  phone_number?: string;
  postal_code?: string;
  sido?: string;
  sigungu?: string;
  address?: string;
  address_detail?: string;
  role: "USER" | "SELLER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "WITHDRAWN";
  readonly last_login_at?: Date;
  readonly deleted_at?: Date;
  readonly created_at: Date;
  readonly updated_at?: Date;
}

export interface SocialAccountDto {
  readonly id: number;
  readonly user_id: UserDto["id"];
  provider: "kakao" | "naver" | "google" | "apple";
  provider_user_id: string;
  access_token?: string;
  refresh_token?: string;
  readonly created_at: Date;
}

export type SignupFormData = Omit<
  UserDto,
  | "id"
  | "nickname"
  | "birth_year"
  | "profile_image_url"
  | "age_range"
  | "status"
  | "last_login_at"
  | "deleted_at"
  | "created_at"
  | "updated_at"
>;

export type LoginFormData = Pick<Required<UserDto>, "email" | "password">;
