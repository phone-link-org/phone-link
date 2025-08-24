export interface Region {
  region_id: number;
  parent_id: number;
  name: string;
}

export interface Store {
  store_id: number;
  region_id: number;
  store_name: string;
  address: string;
  contect: string;
  owner: string;
  created_at: Date;
}

export interface RegionCondition {
  parent: Region;
  child: Region;
}

export interface PhoneManufacturer {
  id: number;
  name_ko: string;
  name_en: string;
}

export interface PhoneModel {
  id: number;
  manufacturer_id: number;
  name_ko: string;
  name_en: string;
  image_url: string;
}

export interface PhoneStorage {
  id: number;
  storage: string;
}

export interface ModelCondition {
  model: PhoneModel;
  storage?: PhoneStorage[];
}

export interface PhoneDevice {
  id: number;
  model_id: number;
  storage_id: number;
  retail_price: number;
  unlocked_price: number;
  coupang_link: string;
  created_at: Date;
}

export interface Carrier {
  carrier_id: number;
  carrier_name: string;
}

export interface DisplayOffer {
  offer_id: number;
  store_name: string;
  region_name: string;
  carrier_name: string;
  model_name: string;
  offer_type: string;
  price: number;
  image_url: string;
}

export interface Addon {
  name: string;
  carrier: string;
  monthlyFee: number;
  requiredDuration: number;
  penaltyFee: number;
}

export interface PriceInput {
  storeId: number;
  model: string;
  carrier: string; // 1: SK, 2: KT, 3: LG
  buyingType: "MNP" | "CHG";
  typePrice: number;
  capacity: string;
}

export interface PriceSubmissionData {
  priceInputs: PriceInput[];
  addons: Addon[];
}

// =================================================================
// User Related Types
// =================================================================
export interface User {
  id: number;
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
  role: "user" | "seller" | "admin";
  status: "active" | "suspended" | "withdrawn";
  last_login_at?: Date;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type SignupFormData = Omit<
  User,
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

export type LoginFormData = Pick<Required<User>, "email" | "password">;
