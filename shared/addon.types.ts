import { StoreDto, CarrierDto } from "./types";

export interface AddonDto {
  readonly id: number;
  storeId: StoreDto["id"];
  carrierId: CarrierDto["id"];
  name: string;
  monthlyFee: number;
  durationMonths: number;
  penaltyFee: number;
  readonly created_at: Date;
  readonly updated_at?: Date;
}
