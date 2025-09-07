import React, { useState } from "react";
import Swal from "sweetalert2";
import type ReqPlanDto from '../../../../shared/reqPlan.types.ts'

// 통신사 ID와 이름을 매핑 (UI 렌더링 순서와 키를 고정)
const CARRIERS: { [key: string]: string } = {
  "1": "SKT",
  "2": "KT",
  "3": "LG U+",
};


// 상태 객체의 타입 정의
type ReqPlansState = {
  [carrierId in keyof typeof CARRIERS]: ReqPlanDto;
};

// 컴포넌트 Props 타입 정의
interface StoreReqPlanFormProps {
  storeId: number;
}

const StoreReqPlanForm: React.FC<StoreReqPlanFormProps> = ({ storeId }) => {
  // 1. 상태 구조를 배열에서 객체로 변경
  const [reqPlans, setReqPlans] = useState<ReqPlansState>({
    "1": { storeId: storeId ,name: "", monthlyFee: "", duration: "" }, // SKT
    "2": { storeId: storeId ,name: "", monthlyFee: "", duration: "" }, // KT
    "3": { storeId: storeId ,name: "", monthlyFee: "", duration: "" }, // LG U+
  });

  // 2. 입력 값 변경 핸들러 수정 (index 대신 carrierId 사용)
  const handleChange = (
    carrierId: keyof typeof CARRIERS,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const numValue = (name === "monthlyFee" || name === "duration") && value !== "" ? parseInt(value, 10) : value;

    setReqPlans(prev => ({
      ...prev,
      [carrierId]: {
        ...prev[carrierId],
        [name]: numValue,
      },
    }));
  };

  // 폼 제출 (저장) 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 3. 유효성 검사 수정
    for (const carrierId in reqPlans) {
      const plan = reqPlans[carrierId as keyof typeof CARRIERS];
      if (!plan.name.trim() || plan.monthlyFee === "" || plan.duration === "") {
        Swal.fire({
          icon: "warning",
          title: "입력 오류",
          text: `모든 통신사의 필수 값을 입력해주세요. (${CARRIERS[carrierId]} 정보 누락)`,
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    }

    // API로 전송할 데이터 형식으로 변환 (객체를 배열로)
    const submissionData = Object.entries(reqPlans).map(([carrierId, plan]) => ({
      ...plan,
      carrierId,
      storeId,
    }));

    try {
      console.log("제출할 데이터:", submissionData);
      // await apiClient.post("/api/store/req-plans", submissionData);

      Swal.fire({
        icon: "success",
        title: "저장 완료",
        text: "요금제 정보가 성공적으로 저장되었습니다.",
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("요금제 저장 실패:", error);
      Swal.fire({
        icon: "error",
        title: "저장 실패",
        text: "데이터 저장 중 오류가 발생했습니다.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-4">
        {/* 4. CARRIERS 객체를 기준으로 고정된 UI 렌더링 */}
        {Object.entries(CARRIERS).map(([carrierId, carrierName]) => (
          <div key={carrierId} className="flex items-center gap-3 p-3 border rounded-md dark:border-gray-700">
            <div className="w-32 font-semibold text-gray-700 dark:text-gray-300">
              {carrierName}
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="name"
                value={reqPlans[carrierId as keyof typeof CARRIERS].name}
                onChange={(e) => handleChange(carrierId as keyof typeof CARRIERS, e)}
                placeholder="요금제명"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                name="monthlyFee"
                value={reqPlans[carrierId as keyof typeof CARRIERS].monthlyFee}
                onChange={(e) => handleChange(carrierId as keyof typeof CARRIERS, e)}
                placeholder="월요금(원)"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm no-spinner focus:outline-none focus:ring-2 focus:ring-primary-light"
                min="0"
              />
            </div>
            <div className="w-28">
              <input
                type="number"
                name="duration"
                value={reqPlans[carrierId as keyof typeof CARRIERS].duration}
                onChange={(e) => handleChange(carrierId as keyof typeof CARRIERS, e)}
                placeholder="유지기간(개월)"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm no-spinner focus:outline-none focus:ring-2 focus:ring-primary-light"
                min="0"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light hover:bg-primary-dark"
        >
          저장
        </button>
      </div>
    </form>
  );
};

export default StoreReqPlanForm;
