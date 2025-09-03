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
  readonly id?: number;
  storeId: StoreDto["id"];
  carrierId: CarrierDto["id"];
  deviceId: PhoneDeviceDto["id"];
  offerType: "MNP" | "CHG";
  price?: number | null;
  sortOrder?: number;
  updatedBy?: UserDto["id"];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
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

export type OfferSearchResult = Pick<OfferDto, "id" | "offerType" | "price"> & {
  storeName: StoreDto["name"];
  regionName: RegionDto["name"];
  carrierName: CarrierDto["name"];
  modelName: string;
  imageUrl: PhoneModelDto["imageUrl"];
};

export type StoreOfferPriceFormData = Pick<
  OfferDto,
  "id" | "offerType" | "price"
> & {
  carrierId: CarrierDto["id"];
  carrierName: CarrierDto["name"];
  modelId: PhoneModelDto["id"];
  modelName: PhoneModelDto["name_ko"];
  storageId: PhoneStorageDto["id"];
  storage: PhoneStorageDto["storage"];
  manufacturerId: PhoneManufacturerDto["id"];
};

//Store Page의 시세표 출력을 위한 커스텀 타입 start
type StoreOfferType = {
  offerType: "MNP" | "CHG";
  price: OfferDto["price"];
};

type StoreOfferCarrier = {
  carrierId: CarrierDto["id"];
  carrierName: CarrierDto["name"];
  offerTypes: StoreOfferType[];
};

type StoreOfferStorage = {
  storageId: PhoneStorageDto["id"];
  storage: PhoneStorageDto["storage"];
  carriers: StoreOfferCarrier[];
};

export type StoreOfferModel = {
  manufacturerId: PhoneManufacturerDto["id"];
  modelId: PhoneModelDto["id"];
  modelName: PhoneModelDto["name_ko"];
  storages: StoreOfferStorage[];
};
//Store Page의 시세표 출력을 위한 커스텀 타입 end
