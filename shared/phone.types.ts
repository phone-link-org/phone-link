export interface PhoneManufacturerDto {
  readonly id: number;
  name_ko: string;
  name_en: string;
}

export interface PhoneModelDto {
  readonly id: number;
  manufacturerId: PhoneManufacturerDto["id"];
  name_ko: string;
  name_en: string;
  imageUrl?: string;
  releaseDate?: Date;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export interface PhoneStorageDto {
  readonly id: number;
  storage: string;
}

export interface PhoneDeviceDto {
  readonly id: number;
  modelId: PhoneModelDto["id"];
  storageId: PhoneStorageDto["id"];
  retailPrice: number;
  unlockedPrice: number;
  coupangLink: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export type OfferModelDto = {
  manufacturerId: PhoneManufacturerDto["id"];
  modelId: PhoneModelDto["id"];
  name: PhoneModelDto["name_ko"];
  storages?: PhoneStorageDto[];
};

// [ AdminPage > 기본정보 관리 > 핸드폰 모델 ] Grid Data
export type PhoneModelGridData = Pick<
  PhoneModelDto,
  "id" | "name_ko" | "imageUrl"
>;

type DeviceInfoData = Pick<
  PhoneDeviceDto,
  "retailPrice" | "unlockedPrice" | "coupangLink"
>;

type StorageData = PhoneStorageDto & { devices: DeviceInfoData[] };

//[ AdminPage > 기본정보 관리 > 핸드폰 모델 ] Grid에서 row를 선택하면 출력되는 Modal form data
export type PhoneDetailFormData = {
  modelId: PhoneModelDto["id"] | null;
  manufacturerId: PhoneManufacturerDto["id"];
  manufacturerName: PhoneManufacturerDto["name_ko"];
  modelName_ko: PhoneModelDto["name_ko"];
  modelName_en: PhoneModelDto["name_en"];
  imageUrl: PhoneModelDto["imageUrl"];
  releaseDate: PhoneModelDto["releaseDate"];
  storages: StorageData[];
};
