import { useState } from "react";
import ExcelUpload from "../components/store/ExcelUpload";
import StoreAddonForm from "../components/store/StoreAddonForm";
import StoreOfferPriceForm from "../components/store/StoreOfferPriceForm";
import { useParams } from "react-router-dom";
import StoreReqPlanForm from "../components/store/StoreReqPlanForm";

const StorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "prices" | "excel" | "addon" | "requiredPlan"
  >("prices");

  const { storeId: storeIdString } = useParams<{ storeId: string }>();

  // storeId가 유효하지 않은 경우(undefined 등) 에러 메시지를 표시
  if (!storeIdString) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold text-red-500">
          잘못된 접근입니다. 매장 ID가 없습니다.
        </h1>
      </div>
    );
  }

  // useParams에서 가져온 storeId는 문자열이므로, 정수로 변환합니다.
  const storeId = parseInt(storeIdString, 10);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-foreground-light dark:text-foreground-dark">
        매장 관리
      </h1>

      {/* 매장 정보 섹션 */}
      <div className="bg-white dark:bg-[#292929] rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground-light dark:text-foreground-dark">
          매장 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              상호명
            </label>
            <p className="text-lg text-foreground-light dark:text-foreground-dark">
              폰링크 강남점
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              주소
            </label>
            <p className="text-lg text-foreground-light dark:text-foreground-dark">
              서울특별시 강남구 역삼동 123-45
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              연락처
            </label>
            <p className="text-lg text-foreground-light dark:text-foreground-dark">
              010-1234-5678
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#292929] rounded-lg shadow-lg p-0 mb-0">
        <h2 className="text-2xl font-semibold p-6 text-foreground-light dark:text-foreground-dark">
          판매 정보
        </h2>
        <div className="border-b border-gray-200 dark:border-background-dark">
          <nav className="-mb-px flex gap-6 px-6" aria-label="Tabs">
            <button
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                activeTab === "prices"
                  ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onClick={() => setActiveTab("prices")}
            >
              시세표
            </button>
            <button
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                activeTab === "requiredPlan"
                  ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onClick={() => setActiveTab("requiredPlan")}
            >
              요금제
            </button>
            <button
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                activeTab === "addon"
                  ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onClick={() => setActiveTab("addon")}
            >
              부가서비스
            </button>
            <button
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                activeTab === "excel"
                  ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onClick={() => setActiveTab("excel")}
            >
              엑셀 파일 업로드
            </button>
          </nav>
        </div>
        {activeTab === "prices" && <StoreOfferPriceForm storeId={storeId} />}
        {activeTab === "requiredPlan" && <StoreReqPlanForm storeId={storeId} /> }
        {activeTab === "addon" && <StoreAddonForm storeId={storeId} />}
        {activeTab === "excel" && (
          <div className="p-6">
            <ExcelUpload />
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
