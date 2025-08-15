/*
    - 상위 지역, 하위 지역 <= RegionSelector.tsx
    - 제조사, 모델명, 용량 <= ModelSelector.tsx
    - 통신사(SKT, KT, LG U+)
    - 번호이동 or 기기변경
    - 사용자가 선택한 조건 태그
    - 검색된 결과 리스트(offer)
*/

import React, { useEffect, useState } from "react";
import type {
  RegionCondition,
  ModelCondition,
  DisplayOffer,
  Carrier,
} from "../../../shared/types";
import { FiX } from "react-icons/fi";
import ModelSelector from "../components/offer/ModelSelector";
import RegionSelector from "../components/offer/RegionSelector";
import CarrierSelector from "../components/offer/CarrierSelector";
import OfferTypeSelector from "../components/offer/OfferTypeSelector";
import { toast } from "sonner";

const OfferPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "region" | "model" | "carrier" | "offerType"
  >("region");

  const [regionConditions, setRegionConditions] = useState<RegionCondition[]>(
    []
  );
  const [modelConditions, setModelConditions] = useState<ModelCondition[]>([]);
  const [carrierConditions, setCarrierConditions] = useState<Carrier[]>([]);
  const [offerTypeConditions, setOfferTypeConditions] = useState<string[]>([]);

  const [offerDatas, setOfferDatas] = useState([]);

  const SERVER = import.meta.env.VITE_API_URL;

  const fetchOfferDatas = async () => {
    try {
      const params = {
        regions: regionConditions ? transformRegions(regionConditions) : null,
        models: modelConditions,
        carriers: carrierConditions,
        offerTypes: offerTypeConditions,
      };

      await fetch(`${SERVER}/api/offer/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
        .then((res) => res.json())
        .then((data) => {
          setOfferDatas(data);
          console.log("검색 결과:", data);
        })
        .catch((error) => {
          console.error("검색 오류:", error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOfferDatas();
  }, [SERVER]);

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

  const handleSearch = () => {
    if (
      regionConditions.length === 0 &&
      modelConditions.length === 0 &&
      carrierConditions.length === 0 &&
      offerTypeConditions.length === 0
    ) {
      toast.error("검색할 조건이 없습니다.");
    }

    fetchOfferDatas();

    // POST 요청으로 JSON 데이터 전송
    //   fetch(`${SERVER}/api/offer/search`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ regions: regionCondData }),
    //   })
    //     .then((res) => res.json())
    //     .then((data) => {
    //       setOfferDatas(data);
    //       console.log("검색 결과:", data);
    //     })
    //     .catch((error) => {
    //       console.error("검색 오류:", error);
    //     });
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-6 text-foreground-light dark:text-foreground-dark">
          가격 비교
        </h1>
        <div className="bg-white dark:bg-[#292929] rounded-t-lg shadow-lg p-0 mb-0">
          <div className="flex items-center gap-2 px-6 pt-4 pb-2">
            {/* TODO: 번호이동/기기변경, 통신사 조건 탭 추가 */}
            <button
              className={`px-5 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none border 
              ${
                activeTab === "region"
                  ? "bg-primary-light dark:bg-primary-dark text-foreground-dark dark:text-foreground-light border-primary-light dark:border-primary-dark"
                  : "bg-gray-100 dark:bg-background-dark text-foreground-light dark:text-foreground-dark border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => setActiveTab("region")}
            >
              지역
            </button>
            <button
              className={`px-5 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none border 
              ${
                activeTab === "model"
                  ? "bg-primary-light dark:bg-primary-dark text-foreground-dark dark:text-foreground-light border-primary-light dark:border-primary-dark"
                  : "bg-gray-100 dark:bg-background-dark text-foreground-light dark:text-foreground-dark border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => setActiveTab("model")}
            >
              모델
            </button>
            <button
              className={`px-5 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none border 
              ${
                activeTab === "carrier"
                  ? "bg-primary-light dark:bg-primary-dark text-foreground-dark dark:text-foreground-light border-primary-light dark:border-primary-dark"
                  : "bg-gray-100 dark:bg-background-dark text-foreground-light dark:text-foreground-dark border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => setActiveTab("carrier")}
            >
              통신사
            </button>
            <button
              className={`px-5 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none border 
              ${
                activeTab === "offerType"
                  ? "bg-primary-light dark:bg-primary-dark text-foreground-dark dark:text-foreground-light border-primary-light dark:border-primary-dark"
                  : "bg-gray-100 dark:bg-background-dark text-foreground-light dark:text-foreground-dark border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => setActiveTab("offerType")}
            >
              개통방식
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#292929] rounded-b-lg shadow-lg px-6 pb-6 pt-2 mb-8">
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
                            (item) => item.child.region_id !== child.region_id
                          )
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
                    model.manufacturer_id
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
                            prev.filter((item) => item.model.id !== model.id)
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
                          prev.filter((c) => c !== carrier)
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
                          prev.filter((type) => type !== offerType)
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
                className="w-1/6 px-4 py-2 text-xl font-medium rounded-2xl bg-primary-light dark:bg-primary-dark text-foreground-dark dark:text-foreground-light hover:opacity-90"
              >
                검색하기
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 mt-8">
          {offerDatas.map((data: DisplayOffer) => {
            // 통신사별 색상 설정
            const getCarrierBadgeColor = (carrier: string) => {
              switch (carrier) {
                case "KT":
                  return "bg-[#5EDFDE] text-black";
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
                key={`offer_${data.offer_id}`}
                className="bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 sm:p-6"
              >
                {/* 상단: 대리점명 / 지역 */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {data.store_name}
                  </span>
                  <span className="mt-1 sm:mt-0">{data.region_name}</span>
                </div>

                {/* 본문: 썸네일 / 모델명+뱃지 / 가격+토글 */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
                  {/* 썸네일 */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center rounded-xl flex-shrink-0 self-center lg:self-start">
                    <img
                      src={`${SERVER}/${data.image_url}`}
                      alt={data.model_name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* 모델명과 뱃지 섹션 */}
                  <div className="flex-1 text-center lg:text-left space-y-3">
                    {/* 뱃지들 */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                      {/* 통신사 뱃지 */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getCarrierBadgeColor(
                          data.carrier_name
                        )}`}
                      >
                        {data.carrier_name}
                      </span>

                      {/* 개통방식 뱃지 */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getOfferTypeBadgeColor(
                          data.offer_type
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
                  <div className="flex flex-col items-center lg:items-end justify-center gap-3 w-full lg:w-auto flex-shrink-0">
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
                    <div className="text-center lg:text-right">
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
          })}
        </div>
      </div>
    </>
  );
};

export default OfferPage;
