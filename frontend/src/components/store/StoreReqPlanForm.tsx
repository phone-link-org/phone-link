import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import type ReqPlanDto from "../../../../shared/reqPlan.types.ts";
import apiClient from "../../api/axios.ts";
import LoadingSpinner from "../LoadingSpinner";
import { useTheme } from "../../hooks/useTheme.ts";

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
  isEditable?: boolean;
}

const StoreReqPlanForm: React.FC<StoreReqPlanFormProps> = ({ storeId, isEditable = true }) => {
  // 1. 상태 구조를 배열에서 객체로 변경
  const [reqPlans, setReqPlans] = useState<ReqPlansState>({
    "1": { storeId: storeId, carrierId: 1, name: "", monthlyFee: "", duration: "" }, // SKT
    "2": { storeId: storeId, carrierId: 2, name: "", monthlyFee: "", duration: "" }, // KT
    "3": { storeId: storeId, carrierId: 3, name: "", monthlyFee: "", duration: "" }, // LG U+
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchReqPlans = async () => {
      try {
        const response = await apiClient.get<{ data: ReqPlanDto[] }>(`/store/${storeId}/req-plans`);
        const plans = response.data.data;

        if (plans && plans.length > 0) {
          const newReqPlans = plans.reduce((acc, plan) => {
            const carrierId = String(plan.carrierId);
            acc[carrierId] = {
              ...plan,
              monthlyFee: plan.monthlyFee ?? "",
              duration: plan.duration ?? "",
            };
            return acc;
          }, {} as ReqPlansState);

          // API에 없는 통신사는 기본값으로 채워줌
          Object.keys(CARRIERS).forEach((id) => {
            if (!newReqPlans[id]) {
              newReqPlans[id] = { storeId: storeId, carrierId: parseInt(id), name: "", monthlyFee: "", duration: "" };
            }
          });

          setReqPlans(newReqPlans);
        }
      } catch (error) {
        console.error("요금제 정보를 불러오는 데 실패했습니다.", error);
      }
    };

    if (storeId) {
      fetchReqPlans();
    }
  }, [storeId]);

  // 숫자에 콤마 추가하는 함수
  const formatNumberWithComma = (value: number | string): string => {
    if (!value || value === 0) return "";
    const numValue = typeof value === "string" ? parseInt(value.replace(/,/g, ""), 10) : value;
    return numValue.toLocaleString();
  };

  // 콤마가 포함된 문자열을 숫자로 변환하는 함수
  const parseNumberFromCommaString = (value: string): number => {
    if (!value) return 0;
    return parseInt(value.replace(/,/g, ""), 10) || 0;
  };

  // 2. 입력 값 변경 핸들러 수정 (index 대신 carrierId 사용)
  const handleChange = (carrierId: keyof typeof CARRIERS, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    // 숫자 필드인 경우 콤마 제거 후 숫자로 변환
    if ((name === "monthlyFee" || name === "duration") && value !== "") {
      processedValue = parseNumberFromCommaString(value);
    }

    setReqPlans((prev) => ({
      ...prev,
      [carrierId]: {
        ...prev[carrierId],
        [name]: processedValue,
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
          background: theme === "dark" ? "#343434" : "#fff",
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          confirmButtonColor: theme === "dark" ? "#9DC183" : "#4F7942",
          cancelButtonColor: theme === "dark" ? "#F97171" : "#EF4444",
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

    setIsSubmitting(true);
    try {
      console.log("제출할 데이터:", submissionData);
      const response = await apiClient.post(`/store/${storeId}/req-plans`, submissionData);

      if (response.data !== null) {
        Swal.fire({
          icon: "success",
          title: "저장 완료",
          text: "요금제 정보가 성공적으로 저장되었습니다.",
          background: theme === "dark" ? "#343434" : "#fff",
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          confirmButtonColor: theme === "dark" ? "#9DC183" : "#4F7942",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("요금제 저장 실패:", error);
      Swal.fire({
        icon: "error",
        title: "저장 실패",
        text: "데이터 저장 중 오류가 발생했습니다.",
        background: theme === "dark" ? "#343434" : "#fff",
        color: theme === "dark" ? "#e5e7eb" : "#1f2937",
        confirmButtonColor: theme === "dark" ? "#9DC183" : "#4F7942",
        cancelButtonColor: theme === "dark" ? "#F97171" : "#EF4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingSpinner isVisible={isSubmitting} title="요금제 정보 저장 중" subtitle="잠시만 기다려주세요..." />
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          {/* 4. CARRIERS 객체를 기준으로 고정된 UI 렌더링 */}
          {Object.entries(CARRIERS).map(([carrierId, carrierName]) => (
            <div key={carrierId} className="border border-gray-200 dark:border-gray-500 rounded-lg p-3 sm:p-4">
              {/* 모바일: 세로 레이아웃, 데스크톱: 가로 레이아웃 */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                {/* 통신사명 */}
                <div className="w-full lg:w-32 flex-shrink-0">
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 lg:hidden">
                    통신사
                  </label>
                  <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md text-center">
                    {carrierName}
                  </div>
                </div>

                {/* 요금제명 */}
                <div className="flex-1 min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    요금제명
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={reqPlans[carrierId as keyof typeof CARRIERS].name}
                    onChange={(e) => handleChange(carrierId as keyof typeof CARRIERS, e)}
                    placeholder="요금제명을 입력하세요"
                    className={`w-full px-2 py-2 text-sm sm:text-base border border-gray-300 rounded-md dark:bg-background-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light ${!isEditable ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}`}
                    disabled={!isEditable}
                  />
                </div>

                {/* 월요금과 유지기간을 한 줄에 배치 (모바일에서는 세로, 태블릿+에서는 가로) */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:flex-col xl:flex-row">
                  {/* 월요금 */}
                  <div className="w-full sm:w-40 lg:w-36 xl:w-40">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      월요금
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="monthlyFee"
                        maxLength={7}
                        value={formatNumberWithComma(reqPlans[carrierId as keyof typeof CARRIERS].monthlyFee)}
                        onChange={(e) => handleChange(carrierId as keyof typeof CARRIERS, e)}
                        placeholder="0"
                        className={`w-full px-2 py-2 pr-8 text-sm sm:text-base border border-gray-300 rounded-md dark:bg-background-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light ${!isEditable ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}`}
                        disabled={!isEditable}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                        원
                      </span>
                    </div>
                  </div>

                  {/* 유지기간 */}
                  <div className="w-full sm:w-32 lg:w-28 xl:w-32">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      유지기간
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        maxLength={2}
                        name="duration"
                        value={reqPlans[carrierId as keyof typeof CARRIERS].duration}
                        onChange={(e) => handleChange(carrierId as keyof typeof CARRIERS, e)}
                        placeholder="0"
                        className={`w-full px-2 py-2 pr-8 text-sm sm:text-base border border-gray-300 rounded-md dark:bg-background-dark dark:text-white no-spinner focus:outline-none focus:ring-2 focus:ring-primary-light ${!isEditable ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}`}
                        min="0"
                        disabled={!isEditable}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                        개월
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 저장 버튼 - 편집 가능할 때만 표시 */}
        {isEditable && (
          <div className="flex justify-center mt-4 pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-md bg-primary-light hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary-light text-white dark:text-black text-sm sm:text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            >
              저장하기
            </button>
          </div>
        )}
      </form>
    </>
  );
};

export default StoreReqPlanForm;
