export interface Region {
  region_id: number;
  parent_id: number;
  name: string;
}

export interface RegionWithParent {
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



export interface PhoneDevice {
  id: number;
  model_id: number;
  storage_id: number;
  retail_price: number;
  unlocked_price: number;
  coupang_link: string;
  created_at: Date;
}

export interface PriceInput {
  storeId: number;
  model: string;
  carrier: number; // 1: SK, 2: KT, 3: LG
  buyingType: "MNP" | "CHG";
  typePrice: number;
}
