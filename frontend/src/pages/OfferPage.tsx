/*
    - 상위 지역, 하위 지역 <= RegionSelector.tsx
    - 제조사, 모델명, 용량 <= ModelSelector.tsx
    - 통신사(SKT, KT, LG U+)
    - 번호이동 or 기기변경
    - 사용자가 선택한 조건 태그
    - 검색된 결과 리스트(offer)
*/

import React, { useState } from "react";
import type { RegionCondition, ModelCondition } from "../../../shared/types";
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
  const [carrierConditions, setCarrierConditions] = useState<string[]>([]);
  const [offerTypeConditions, setOfferTypeConditions] = useState<string[]>([]);

  const SERVER = import.meta.env.VITE_API_URL;

  // TODO: DB에서 가져오게 처리해야되는데 일단 지금은 이렇게....ㅎㅎ
  const getManufacturerName = (manufacturerId: number): string => {
    const manufacturers: { [key: number]: string } = {
      1: "삼성",
      2: "애플",
    };
    return manufacturers[manufacturerId] || "알 수 없음";
  };

  const handleSearch = () => {
    if (
      regionConditions.length === 0 &&
      modelConditions.length === 0 &&
      carrierConditions.length === 0 &&
      offerTypeConditions.length === 0
    ) {
      toast.error("검색할 조건이 없습니다.");
    }

    // 검색 조건들을 객체로 구성
    const searchConditions = {
      regionConditions,
      modelConditions,
      carrierConditions,
      offerTypeConditions,
    };

    console.log(searchConditions);

    // POST 요청으로 JSON 데이터 전송
    fetch(`${SERVER}/api/offer/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchConditions),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("검색 결과:", data);
        // TODO: 검색 결과를 상태에 저장
      })
      .catch((error) => {
        console.error("검색 오류:", error);
        // TODO: 에러 처리
      });
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
                    key={carrier}
                    className="flex items-center text-sm bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-200 px-3 py-1 rounded-full"
                  >
                    {carrier}
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
        <div className="flex flex-col gap-4 mt-8">
          {[1, 2, 3].map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 rounded-2xl shadow p-4 flex flex-col gap-3"
            >
              {/* 상단: 대리점명 / 지역 */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">스마트모바일 강남점</span>
                <span>서울 강남구</span>
              </div>

              {/* 본문: 썸네일 / 모델명 / 가격+토글 */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* 썸네일 */}
                <img
                  src="https://placehold.co/100x100?text=Phone"
                  alt="Phone Thumbnail"
                  className="w-24 h-24 object-cover rounded-lg self-center md:self-auto"
                />

                {/* 모델명 */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                    아이폰 15 Pro
                  </h2>
                </div>

                {/* 가격 + 토글 */}
                <div className="flex flex-col items-center md:items-end justify-between gap-1 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-300">
                      24개월로 나누기
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-10 h-6 bg-gray-300 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark rounded-full transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 dark:border-gray-500 rounded-full transition-transform duration-200 transform peer-checked:translate-x-4"></div>
                    </label>
                  </div>
                  <p className="text-base font-bold text-primary-light dark:text-primary-dark mt-1">
                    ₩1,290,000
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OfferPage;
