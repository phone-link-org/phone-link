// 요금제 데이터의 타입 정의
export default interface ReqPlanDto {
  storeId: number;
  name: string;
  monthlyFee: number | "";
  duration: number | ""; // 유지기간 (개월)
}
