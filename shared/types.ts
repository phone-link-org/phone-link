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
