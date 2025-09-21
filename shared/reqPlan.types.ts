// 요금제 데이터의 타입 정의
export interface ReqPlanDto {
  storeId: number;
  name: string;
  carrierId: number;
  monthlyFee: number;
  duration: number | ""; // 유지기간 (개월)
}
