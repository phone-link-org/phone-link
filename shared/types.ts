export interface Region {
  region_id: number;
  parent_id: number;
  name: string;
}

export interface RegionWithParent {
  parent: Region;
  child: Region;
}