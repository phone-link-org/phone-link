import React, { useEffect, useState, useRef, useCallback } from "react";
import ModelSelector from "../components/offer/ModelSelector";
import RegionSelector from "../components/offer/RegionSelector";
import CarrierSelector from "../components/offer/CarrierSelector";
import OfferTypeSelector from "../components/offer/OfferTypeSelector";
import { useTheme } from "../hooks/useTheme";
import { FiX } from "react-icons/fi";
import { BsArrowClockwise } from "react-icons/bs";
import { FaSort, FaSortAmountDownAlt, FaSortAmountDown } from "react-icons/fa";
import { toast } from "sonner";
import Swal from "sweetalert2";
import type {
  RegionCondition,
  ModelCondition,
  DisplayOffer,
  Carrier,
} from "../../../shared/types";

const OfferPage: React.FC = () => {
  const { theme } = useTheme(); // 현재 테마 가져오기

  const [activeTab, setActiveTab] = useState<
    "region" | "model" | "carrier" | "offerType"
  >("region");

  const [regionConditions, setRegionConditions] = useState<RegionCondition[]>(
    [],
  );
  const [modelConditions, setModelConditions] = useState<ModelCondition[]>([]);
  const [carrierConditions, setCarrierConditions] = useState<Carrier[]>([]);
  const [offerTypeConditions, setOfferTypeConditions] = useState<string[]>([]);

  // --- 무한 스크롤 상태 추가 ---
  const [offerDatas, setOfferDatas] = useState<DisplayOffer[]>([]);
  const pageRef = useRef(1); // 페이지 번호를 ref로 관리
  const [hasNextPage, setHasNextPage] = useState(true); // 다음 페이지 존재 여부
  const [loading, setLoading] = useState(false); // 데이터 로딩 상태
  const [sortOrder, setSortOrder] = useState("default"); // 정렬 순서 상태
  // ---

  const SERVER = import.meta.env.VITE_API_URL;

  // --- 데이터 fetching 로직 수정 ---
  const fetchOfferDatas = useCallback(
    async (isNewSearch = false) => {
      if (loading) return; // 이미 로딩 중이면 실행 방지
      setLoading(true);

      if (isNewSearch) {
        pageRef.current = 1; // 새 검색 시 페이지 번호 1로 초기화
      }

      try {
        const params = {
          regions: regionConditions ? transformRegions(regionConditions) : null,
          models: modelConditions,
          carriers: carrierConditions,
          offerTypes: offerTypeConditions,
          page: pageRef.current, // ref에서 현재 페이지 번호 가져오기
          limit: 20,
          sortOrder: sortOrder, // 정렬 순서 추가
        };

        const response = await fetch(`${SERVER}/api/offer/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error("서버에서 데이터를 가져오는 데 실패했습니다.");
        }

        const data = await response.json();

        setOfferDatas((prev) =>
          isNewSearch ? data.offers : [...prev, ...data.offers],
        );
        setHasNextPage(data.hasNextPage);
        if (data.hasNextPage) {
          pageRef.current += 1; // 다음 페이지 번호 증가
        }
      } catch (error) {
        console.error("검색 오류:", error);
        toast.error("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    // page state를 제거하여 불필요한 재실행 방지
    [
      loading,
      regionConditions,
      modelConditions,
      carrierConditions,
      offerTypeConditions,
      sortOrder,
      SERVER,
    ],
  );
  // ---

  // --- Intersection Observer 설정 ---
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOfferElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        // 마지막 요소가 보이고, 다음 페이지가 있으며, 로딩 중이 아닐 때 다음 페이지 fetch
        if (entries[0].isIntersecting && hasNextPage && !loading) {
          fetchOfferDatas();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasNextPage, fetchOfferDatas],
  );
  // ---

  // 컴포넌트 마운트 시 첫 데이터 로드
  useEffect(() => {
    fetchOfferDatas(true);
  }, []);

  // 정렬 순서 변경 시, 새로운 검색 실행
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchOfferDatas(true);
  }, [sortOrder]);

  // TODO: DB에서 가져오게 처리해야되는데 일단 지금은 이렇게....ㅎㅎ
  const getManufacturerName = (manufacturerId: number): string => {
    const manufacturers: { [key: number]: string } = {
      1: "삼성",
      2: "애플",
    };
    return manufacturers[manufacturerId] || "알 수 없음";
  };

  function transformRegions(data: RegionCondition[]) {
    const result = {
      allRegion: [] as number[],
      region: [] as number[],
    };

    data.forEach((item) => {
      if (item.child.region_id < 0) {
        result.allRegion.push(item.parent.region_id);
      } else {
        result.region.push(item.child.region_id);
      }
    });

    return result;
  }

  // --- 검색 핸들러 수정 ---
  const handleSearch = () => {
    if (
      regionConditions.length === 0 &&
      modelConditions.length === 0 &&
      carrierConditions.length === 0 &&
      offerTypeConditions.length === 0
    ) {
      toast.error("검색할 조건이 없습니다.");
      return; // 검색 조건이 없으면 fetch하지 않고 종료
    }

    pageRef.current = 1; // 페이지 1로 초기화
    setOfferDatas([]); // 기존 데이터 초기화
    fetchOfferDatas(true); // 새 검색 시작

    // 타겟 요소로 스크롤 이동
    const targetElement = document.getElementById(
      "target-box",
    ) as HTMLDivElement;
    if (targetElement) {
      // 타겟 요소의 절대 Y 좌표
      const targetTop =
        targetElement.getBoundingClientRect().top + window.scrollY;

      const scrollToPosition = targetTop - 70;

      window.scrollTo({
        top: scrollToPosition,
        behavior: "smooth",
      });
    }
  };
  // ---

  // --- 검색 조건 초기화 핸들러 ---
  const handleResetConditions = () => {
    Swal.fire({
      html: "검색 조건을 초기화하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      background: theme === "dark" ? "#343434" : "#fff",
      color: theme === "dark" ? "#e5e7eb" : "#1f2937",
      confirmButtonColor: theme === "dark" ? "#9DC183" : "#4F7942",
      cancelButtonColor: theme === "dark" ? "#F97171" : "#EF4444",
      confirmButtonText: "초기화",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        setRegionConditions([]);
        setModelConditions([]);
        setCarrierConditions([]);
        setOfferTypeConditions([]);
        setSortOrder("default"); // 정렬 순서도 초기화
      }
    });
  };
  // ---

  // --- 정렬 버튼 토글 핸들러 ---
  const handleSortToggle = () => {
    setSortOrder((currentOrder) => {
      if (currentOrder === "default") return "price_asc";
      if (currentOrder === "price_asc") return "price_desc";
      return "default";
    });
  };

  // 현재 정렬 상태에 따른 텍스트와 아이콘을 반환하는 헬퍼 객체
  const sortOptions = {
    default: { text: "기본 정렬", Icon: FaSort },
    price_asc: { text: "가격 낮은 순", Icon: FaSortAmountDownAlt },
    price_desc: { text: "가격 높은 순", Icon: FaSortAmountDown },
  };
  // ---

  const hasConditions =
    regionConditions.length > 0 ||
    modelConditions.length > 0 ||
    carrierConditions.length > 0 ||
    offerTypeConditions.length > 0;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-6 text-foreground-light dark:text-foreground-dark">
          가격 비교
        </h1>
        <div className="bg-white dark:bg-[#292929] rounded-t-lg shadow-lg p-0 mb-0">
          <div className="border-b border-gray-200 dark:border-background-dark">
            <nav className="-mb-px flex gap-6 px-6" aria-label="Tabs">
              <button
                className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                  activeTab === "region"
                    ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                onClick={() => setActiveTab("region")}
              >
                지역
              </button>
              <button
                className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                  activeTab === "model"
                    ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                onClick={() => setActiveTab("model")}
              >
                모델
              </button>
              <button
                className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                  activeTab === "carrier"
                    ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                onClick={() => setActiveTab("carrier")}
              >
                통신사
              </button>
              <button
                className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                  activeTab === "offerType"
                    ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                onClick={() => setActiveTab("offerType")}
              >
                개통방식
              </button>
            </nav>
          </div>
        </div>

        <div className="bg-white dark:bg-[#292929] rounded-b-lg shadow-lg px-6 pb-6 pt-3 mb-8">
          <div className="grid grid-cols-1 gap-6">
            {activeTab === "region" ? (
              <RegionSelector
                regionConditions={regionConditions}
                onRegionConditionsChange={setRegionConditions}
              />
            ) : activeTab === "carrier" ? (
              <CarrierSelector
                carrierConditions={carrierConditions}
                onCarriersChange={setCarrierConditions}
              />
            ) : activeTab === "offerType" ? (
              <OfferTypeSelector
                offerTypeConditions={offerTypeConditions}
                onOfferTypesChange={setOfferTypeConditions}
              />
            ) : (
              <div>
                <ModelSelector
                  modelConditions={modelConditions}
                  onModelConditionsChange={setModelConditions}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 mt-6 px-2">
            {/* --- 검색 조건 제목 및 초기화 버튼 --- */}
            {hasConditions && (
              <div className="flex items-baseline gap-3 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  검색 조건
                </h3>
                <button
                  onClick={handleResetConditions}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="검색 조건 초기화"
                >
                  <BsArrowClockwise />
                  <span>초기화</span>
                </button>
              </div>
            )}
            {/* --- */}

            {/* 지역 조건태그 */}
            {regionConditions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {regionConditions.map(({ parent, child }) => (
                  <span
                    key={child.region_id}
                    className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full"
                  >
                    {parent.name} {child.name}
                    <button
                      onClick={() =>
                        setRegionConditions((prev) =>
                          prev.filter(
                            (item) => item.child.region_id !== child.region_id,
                          ),
                        )
                      }
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 모델 조건태그 */}
            {modelConditions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {modelConditions.map(({ model, storage }) => {
                  // 제조사 정보 가져오기 (manufacturer_id를 기반으로)
                  const manufacturerName = getManufacturerName(
                    model.manufacturer_id,
                  );

                  // 조건 태그 텍스트 생성
                  let tagText = "";

                  if (model.id < 0) {
                    // 전체 모델 선택 (음수 ID)
                    tagText = manufacturerName;
                  } else {
                    // 특정 모델 선택
                    tagText = model.name_ko;

                    if (storage && storage.length > 0) {
                      if (storage.length === 1 && storage[0].id < 0) {
                        // 전체 용량 선택
                        tagText = model.name_ko;
                      } else {
                        // 특정 용량들 선택
                        const storageNames = storage
                          .filter((s) => s.id > 0) // 전체 용량 제외
                          .map((s) => s.storage)
                          .join(", ");
                        tagText = `${model.name_ko} ${storageNames}`;
                      }
                    }
                  }

                  return (
                    <span
                      key={model.id}
                      className="flex items-center text-sm bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full"
                    >
                      {tagText}
                      <button
                        onClick={() =>
                          setModelConditions((prev) =>
                            prev.filter((item) => item.model.id !== model.id),
                          )
                        }
                        className="ml-2 text-blue-500 hover:text-red-500"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* 통신사 조건태그 */}
            {carrierConditions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {carrierConditions.map((carrier) => (
                  <span
                    key={carrier.carrier_id}
                    className="flex items-center text-sm bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-200 px-3 py-1 rounded-full"
                  >
                    {carrier.carrier_name}
                    <button
                      onClick={() =>
                        setCarrierConditions((prev) =>
                          prev.filter((c) => c !== carrier),
                        )
                      }
                      className="ml-2 text-green-500 hover:text-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 개통방식 조건태그 */}
            {offerTypeConditions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {offerTypeConditions.map((offerType) => (
                  <span
                    key={offerType}
                    className="flex items-center text-sm bg-purple-100 dark:bg-purple-700 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full"
                  >
                    {offerType === "MNP" ? "번호이동" : "기기변경"}
                    <button
                      onClick={() =>
                        setOfferTypeConditions((prev) =>
                          prev.filter((type) => type !== offerType),
                        )
                      }
                      className="ml-2 text-purple-500 hover:text-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button
                // TODO: 검색 기능 연결
                onClick={handleSearch}
                className="w-full sm:w-1/4 md:w-1/6 px-4 py-2 text-xl font-medium rounded-lg bg-primary-light dark:bg-primary-dark text-foreground-dark dark:text-foreground-light hover:opacity-90"
              >
                검색하기
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 mt-8" id="target-box">
          <div className="flex justify-end items-center -mb-4">
            <button
              onClick={handleSortToggle}
              className="flex items-center gap-2 py-2 px-3 transition-colors focus:outline-none text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-dark"
            >
              <span className="text-sm font-medium">
                {sortOptions[sortOrder as keyof typeof sortOptions].text}
              </span>
              {React.createElement(
                sortOptions[sortOrder as keyof typeof sortOptions].Icon,
              )}
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {offerDatas.length === 0 && !loading ? (
              <div className="flex justify-center items-center text-center min-h-[30vh]">
                <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                  검색 결과가 없습니다.
                </p>
              </div>
            ) : (
              offerDatas.map((data: DisplayOffer, index) => {
                // 마지막 요소에 ref를 할당하여 Intersection Observer가 감지하도록 함
                const isLastElement = offerDatas.length === index + 1;

                // 통신사별 색상 설정
                const getCarrierBadgeColor = (carrier: string) => {
                  switch (carrier) {
                    case "KT":
                      return "bg-[#5EDFDE] text-white";
                    case "SKT":
                      return "bg-[#3618CE] text-white";
                    case "LGU+":
                      return "bg-[#E2207E] text-white";
                    default:
                      return "bg-gray-400 text-white";
                  }
                };

                // 개통방식별 색상 설정
                const getOfferTypeBadgeColor = (offerType: string) => {
                  return offerType === "번호이동"
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500 text-white";
                };

                return (
                  <div
                    ref={isLastElement ? lastOfferElementRef : null}
                    key={`offer_${data.offer_id}_${index}`}
                    className="bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 sm:p-6"
                  >
                    {/* 상단: 대리점명 / 지역 */}
                    <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {data.store_name}
                      </span>
                      <span className="mt-1 sm:mt-0">{data.region_name}</span>
                    </div>

                    {/* 본문: 썸네일 / 모델명+뱃지 / 가격+토글 */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                      {/* 썸네일 */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center flex-shrink-0 self-center sm:self-start">
                        <img
                          src={`${SERVER}${data.image_url}`}
                          alt={data.model_name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      {/* 모델명과 뱃지 섹션 */}
                      <div className="flex-1 text-center sm:text-left space-y-3">
                        {/* 뱃지들 */}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          {/* 통신사 뱃지 */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getCarrierBadgeColor(
                              data.carrier_name,
                            )}`}
                          >
                            {data.carrier_name}
                          </span>

                          {/* 개통방식 뱃지 */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getOfferTypeBadgeColor(
                              data.offer_type,
                            )}`}
                          >
                            {data.offer_type}
                          </span>
                        </div>

                        {/* 모델명 */}
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                          {data.model_name}
                        </h2>
                      </div>

                      {/* 가격 + 토글 */}
                      <div className="flex flex-col items-center sm:items-end justify-center gap-3 w-full sm:w-auto flex-shrink-0">
                        {/* 토글 스위치 */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            24개월로 나누기
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-300 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark rounded-full transition-colors duration-200"></div>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 dark:border-gray-500 rounded-full transition-transform duration-200 transform peer-checked:translate-x-5 shadow-sm"></div>
                          </label>
                        </div>

                        {/* 가격 */}
                        <div className="text-center sm:text-right">
                          <p
                            className={`text-2xl sm:text-3xl font-bold ${
                              data.price < 0
                                ? "text-red-500 dark:text-red-400"
                                : "text-primary-light dark:text-primary-dark"
                            }`}
                          >
                            {data.price}만원
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {/* 로딩 인디케이터 */}
            {loading && (
              <div className="flex justify-center items-center py-4">
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  데이터를 불러오는 중...
                </p>
              </div>
            )}
            {/* 더 이상 데이터가 없을 때 표시 */}
            {!hasNextPage && !loading && offerDatas.length > 0 && (
              <div className="flex justify-center items-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  검색결과 끝
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferPage;
