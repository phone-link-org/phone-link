import { useEffect, useState } from "react";
import ExcelUpload from "../components/store/ExcelUpload";
import StoreAddonForm from "../components/store/StoreAddonForm";
import StoreOfferPriceForm from "../components/store/StoreOfferPriceForm";
import { useParams } from "react-router-dom";
import StoreReqPlanForm from "../components/store/StoreReqPlanForm";
import apiClient from "../api/axios";
import type { StoreDto } from "../../../shared/store.types";

const StorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"prices" | "excel" | "addon" | "requiredPlan">("prices");
  const { storeId: storeIdString } = useParams<{ storeId: string }>();

  // 1. 매장 정보, 로딩, 에러 상태 추가
  const [store, setStore] = useState<StoreDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // storeId를 숫자로 변환
  const storeId = storeIdString ? parseInt(storeIdString, 10) : null;

  useEffect(() => {
    // storeId가 유효하지 않으면 API 호출 중단
    if (!storeId) {
      setError("잘못된 접근입니다. 매장 ID가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchStoreData = async () => {
      setIsLoading(true); // 데이터 fetching 시작 시 로딩 상태로 설정
      try {
        const response = await apiClient.get<{ data: StoreDto }>(`/store/${storeId}/detail`);
        setStore(response.data.data); // data 객체 안의 data를 사용
        setError(null); // 이전 에러 상태 초기화
      } catch (err) {
        setError("매장 정보를 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false); // 성공/실패 여부와 관계없이 로딩 상태 해제
      }
    };

    fetchStoreData();
  }, [storeId]); // storeId가 변경될 때마다 effect 재실행

  // 2. 로딩 및 에러 상태에 따른 UI 렌더링
  if (isLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-8 mt-16 text-center">로딩 중...</div>;
  }

  if (error) {
    return <div className="max-w-6xl mx-auto px-4 py-8 mt-16 text-center text-red-500">{error}</div>;
  }
  
  if (!store || !storeId) {
    return <div className="max-w-6xl mx-auto px-4 py-8 mt-16 text-center">매장 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-foreground-light dark:text-foreground-dark">
        매장 관리
      </h1>

      {/* 3. API로 받아온 동적 데이터로 매장 정보 섹션 렌더링 */}
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
              {store.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              주소
            </label>
            <p className="text-lg text-foreground-light dark:text-foreground-dark">
              {`${store.address} ${store.addressDetail || ''}`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              연락처
            </label>
            <p className="text-lg text-foreground-light dark:text-foreground-dark">
              {store.contact}
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
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${activeTab === "prices" ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark" : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"}`}
              onClick={() => setActiveTab("prices")}
            >
              시세표
            </button>
            <button
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${activeTab === "requiredPlan" ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark" : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"}`}
              onClick={() => setActiveTab("requiredPlan")}
            >
              요금제
            </button>
            <button
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${activeTab === "addon" ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark" : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"}`}
              onClick={() => setActiveTab("addon")}
            >
              부가서비스
            </button>
            <button
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${activeTab === "excel" ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark" : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"}`}
              onClick={() => setActiveTab("excel")}
            >
              엑셀 파일 업로드
            </button>
          </nav>
        </div>
        {activeTab === "prices" && <StoreOfferPriceForm storeId={storeId} />}
        {activeTab === "requiredPlan" && <StoreReqPlanForm storeId={storeId} />}
        {activeTab === "addon" && <StoreAddonForm storeId={storeId} />}
        {activeTab === "excel" && <div className="p-6"><ExcelUpload /></div>}
      </div>
    </div>
  );
};

export default StorePage;
