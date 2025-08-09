export interface Region {
  region_id: number;
  parent_id: number;
  name: string;
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
