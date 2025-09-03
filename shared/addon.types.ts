import type { StoreDto, CarrierDto } from "./types";

export interface AddonDto {
  readonly id: number;
  storeId: StoreDto["id"];
  carrierId: CarrierDto["id"];
  name: string;
  monthlyFee: number;
  durationMonths: number;
  penaltyFee: number;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export type AddonFormData = Pick<
  AddonDto,
  "name" | "carrierId" | "monthlyFee" | "durationMonths" | "penaltyFee"
>;
