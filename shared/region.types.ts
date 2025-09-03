export interface RegionDto {
  code: string;
  name: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export type OfferRegionDto = Pick<RegionDto, "code" | "name">;
