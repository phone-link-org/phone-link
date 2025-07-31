export interface Region {
  region_id: number;
  parent_id: number;
  name: string;
}

export interface RegionWithParent {
  parent: Region;
  child: Region;
}

export interface PriceInput {
  storeId: number;
  devices: string;
  carrier: number; // 1: SK, 2: KT, 3: LG
  buyingType: 'MNP' | 'CHG';
  typePrice: number;
  location: string;
}

export interface Device {
  device_id: number;
  brand: string;
  model_KR: string;
  model_US: string;
  storage: string;
  retail_price: number;
  unlocked_price: number;
  coupang_link: string;
  created_at: Date;
}