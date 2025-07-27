export interface Input{
  sellerId: number
  storeId: number
  devices: string
  carrier: number
  buyingType: 'MNP'|'CHG'
  typePrice: number
  addons: string
  addonsFee: number
  addonsRequiredDuration: number
  location: string
}
