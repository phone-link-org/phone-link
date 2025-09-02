import type {
  CarrierDto,
  OfferModelDto,
  OfferRegionDto,
  PhoneDeviceDto,
  PhoneManufacturerDto,
  PhoneModelDto,
  PhoneStorageDto,
  RegionDto,
  StoreDto,
  UserDto,
} from "./types";

export interface OfferDto {
  readonly id: number;
  store_id: StoreDto["id"];
  carrier_id: CarrierDto["id"];
  device_id: PhoneDeviceDto["id"];
  offer_type: "MNP" | "CHG";
  price: number;
  sort_order: number;
  updated_by?: UserDto["id"];
  readonly created_at: Date;
  readonly updated_at?: Date;
}

export type OfferSearchRequest = {
  regions: OfferRegionDto[];
  models: OfferModelDto[];
  carriers: CarrierDto[];
  offerTypes: ("MNP" | "CHG")[];
  page: number;
  limit: number;
  sortOrder: "default" | "price_asc" | "price_desc";
};

export type OfferSearchResult = Pick<
  OfferDto,
  "id" | "offer_type" | "price"
> & {
  store_name: StoreDto["name"];
  region_name: RegionDto["name"];
  carrier_name: CarrierDto["name"];
  model_name: string;
  image_url: PhoneModelDto["image_url"];
};

export type StoreOfferPriceFormData = Pick<
  OfferDto,
  "id" | "offer_type" | "price"
> & {
  carrier_name: CarrierDto["name"];
  model_name: PhoneModelDto["name_ko"];
  storage: PhoneStorageDto["storage"];
  manufacturer_id: PhoneManufacturerDto["id"];
};
