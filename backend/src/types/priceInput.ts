import { OfferType } from "../../../shared/constants";

export interface Input {
  sellerId: number;
  storeId: number;
  devices: string;
  carrier: number;
  buyingType: OfferType;
  typePrice: number;
  addons: string;
  addonsFee: number;
  addonsRequiredDuration: number;
  location: string;
}
