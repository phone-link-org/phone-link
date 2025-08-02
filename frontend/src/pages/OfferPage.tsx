import React, { useState, useEffect } from "react";
import type { Region, RegionWithParent } from "../../../shared/types";
import type { OfferSearchCondition } from "../../../shared/offer_types";

import { FiX } from "react-icons/fi";
import ModelSelector from "../components/offer/ModelSelector";
import RegionSelector from "../components/offer/RegionSelector";
import { useOfferSearchCondition } from "../hooks/useOfferSearchCondition";

const OfferPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"region" | "model">("region");

  const [selectedSubRegions, setSelectedSubRegions] = useState<
    RegionWithParent[]
  >([]);

  const { offerSearchCondition, setOfferSearchCondition } =
    useOfferSearchCondition();

  // offerSearchCondition이 변경될 때마다 로그 출력
  useEffect(() => {
    console.log("offerSearchCondition 변경됨:", offerSearchCondition);
  }, [offerSearchCondition]);

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
          </div>
        </div>

        <div className="bg-white dark:bg-[#292929] rounded-b-lg shadow-lg px-6 pb-6 pt-2 mb-8">
          <div className="grid grid-cols-1 gap-6">
            {activeTab === "region" ? (
              <RegionSelector
                selectedSubRegions={selectedSubRegions}
                setSelectedSubRegions={setSelectedSubRegions}
                setOfferSearchCondition={setOfferSearchCondition}
              />
            ) : (
              <ModelSelector
                setOfferSearchCondition={setOfferSearchCondition}
              />
            )}
          </div>
          <div className="flex flex-col gap-3 mt-6 px-2">
            {/* 조건태그 있을 때만 보여줌 */}
            {offerSearchCondition?.region &&
              offerSearchCondition.region.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {offerSearchCondition.region.map((regionCondition, index) => (
                    <span
                      key={`${regionCondition.parent}-${index}`}
                      className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full"
                    >
                      {/* 여기서 regionCondition.parent와 regionCondition.child를 사용하여 지역명을 표시 */}
                      {/* 실제 지역명을 가져오려면 regions 데이터를 참조해야 할 수 있습니다 */}
                      { regionCondition.parent} -{" "}
                      {regionCondition.child.join(", ")}
                      <button
                        onClick={() => {
                          setOfferSearchCondition((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              region: prev.region.filter((_, i) => i !== index),
                            };
                          });
                        }}
                        className="ml-2 text-gray-500 hover:text-red-500"
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
                onClick={() => {}}
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
                  src="https://via.placeholder.com/100x100?text=Phone"
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
