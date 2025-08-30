export interface PhoneManufacturerDto {
  readonly id: number;
  name_ko: string;
  name_en: string;
}

export interface PhoneModelDto {
  readonly id: number;
  manufacturer_id: PhoneManufacturerDto["id"];
  name_ko: string;
  name_en: string;
  image_url?: string;
  release_date?: Date;
  readonly created_at: Date;
  readonly updated_at?: Date;
}

export interface PhoneStorageDto {
  readonly id: number;
  storage: string;
}

export interface PhoneDeviceDto {
  readonly id: number;
  model_id: PhoneModelDto["id"];
  storage_id: PhoneStorageDto["id"];
  retail_price: number;
  unlocked_price?: number;
  coupang_link?: string;
  readonly created_at: Date;
  readonly updated_at?: Date;
}
