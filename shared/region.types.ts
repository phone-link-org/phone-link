export interface RegionDto {
  code: string;
  name: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  last_synced_at?: Date;
  created_at: Date;
  updated_at?: Date;
}

export type OfferRegionDto = Pick<RegionDto, "code" | "name">;
