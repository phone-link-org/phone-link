// 다음(카카오) 주소 API 응답 타입
export interface DaumPostcodeData {
  address: string;
  addressType: "R" | "J";
  bname: string;
  buildingName: string;
  zonecode: string;
  sido: string;
  sigungu: string;
  sigunguCode?: string; // StoreRegisterPage에서 사용
}
