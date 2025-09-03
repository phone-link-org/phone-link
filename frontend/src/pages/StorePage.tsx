import { useState } from "react";
import ExcelUpload from "../components/store/ExcelUpload";
import StoreAddonForm from "../components/store/StoreAddonForm";
import StoreOfferPriceForm from "../components/store/StoreOfferPriceForm";

const StorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "prices" | "excel" | "addon" | "requiredPlan"
  >("prices");

  const storeId = 3; //TODO: 매장 ID 가져오기

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
        {activeTab === "requiredPlan" && (
          <p className="text-black dark:text-white p-6">
            필수 요금제 설정 화면
          </p>
        )}
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
