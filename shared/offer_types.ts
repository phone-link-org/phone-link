export interface RegionCondition {
  parent: number;
  child: number[];
}

export interface ModelCondition {
  id: number;
  storageId: number[];
}

export interface ManufacturerModelCondition {
  manufacturer: number;
  model: ModelCondition[];
}

export interface OfferSearchCondition {
  region: RegionCondition[];
  model: ManufacturerModelCondition[];
  offerType: string[];
  carrier: string[];
}
