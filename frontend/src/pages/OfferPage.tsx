import React, { useState, useEffect } from "react";
import type { Region, RegionWithParent } from "../../../shared/types";
import CustomCheckbox from "../components/CustomCheckbox";
import { FiX } from "react-icons/fi";

const OfferPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"region" | "model">("region");

  const [regions, setRegions] = useState<Region[]>([]);
  const [subRegions, setSubRegions] = useState<Region[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<Region | null>(null);
  const [selectedSubRegions, setSelectedSubRegions] = useState<RegionWithParent[]>([]);

  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedStorages, setSelectedStorages] = useState<string[]>([]);

  const [carriers, setCarriers] = useState<string[]>([]);
  const [buyingTypes, setBuyingTypes] = useState<string[]>([]);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [selectedBuyingTypes, setSelectedBuyingTypes] = useState<string[]>([]);


  const SERVER = import.meta.env.VITE_API_URL;

  // 시/도 지역 데이터 GET
  useEffect(() => {
    fetch(`${SERVER}/api/offer/regions?parentId=null`)
      .then((res) => res.json())
      .then(setRegions);
  }, [SERVER]);

  // 시/도 지역 선택 시 구/군(하위 지역) 지역 데이터 GET
  useEffect(() => {
    if (selectedRegions !== null) {
      const parentId = selectedRegions?.region_id;
      fetch(`${SERVER}/api/offer/regions?parentId=${parentId}`)
        .then((res) => res.json())
        .then((data) => {
          const all = {
            region_id: -parentId,
            parent_id: parentId,
            name: "전체",
          };
          setSubRegions([all, ...data]);
        });
    }
  }, [selectedRegions, SERVER]);

  const handleRegionChange = (selectedRegion: Region) => {
    setSelectedRegions(selectedRegion);
  };

  const handleSubRegionChange = (child: Region) => {
    if (!selectedRegions) return;

    setSelectedSubRegions((prev) => {
      const parentId = selectedRegions.region_id;

      const isAllSelected = child.region_id === -parentId;

      if (isAllSelected) {
        // 같은 parent_id를 가진 기존 항목들을 모두 제거하고 '전체'만 추가
        const filtered = prev.filter(
          (item) => item.parent.region_id !== parentId
        );
        return [...filtered, { parent: selectedRegions, child }];
      } else {
        const filtered = prev.filter(
          (item) =>
            !(
              item.parent.region_id === parentId &&
              item.child.region_id === -parentId
            )
        );

        const alreadySelected = filtered.find(
          (item) => item.child.region_id === child.region_id
        );

        if (alreadySelected) {
          // 이미 선택된 항목이면 제거
          return filtered.filter(
            (item) => item.child.region_id !== child.region_id
          );
        } else {
          // 새로운 항목 추가
          return [...filtered, { parent: selectedRegions, child }];
        }
      }
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
          </div>
        </div>

        <div className="bg-white dark:bg-[#292929] rounded-b-lg shadow-lg px-6 pb-6 pt-2 mb-8">
          <div className="grid grid-cols-1 gap-6">
            {activeTab === "region" ? (
              <div className="flex gap-6">
                <div className="w-1/4 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {regions.map((region) => (
                      <label
                        key={region.name}
                        className="flex justify-center items-center cursor-pointer"
                      >
                        <CustomCheckbox
                          label={region.name}
                          checked={selectedRegions?.name === region.name}
                          onChange={() => handleRegionChange(region)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="w-3/4 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {selectedRegions === null ? (
                      <div className="text-gray-400 text-xs">
                        시/도를 먼저 선택하세요.
                      </div>
                    ) : subRegions?.length === 0 ? (
                      <span className="text-gray-400 text-xs">
                        구/군 데이터 없음
                      </span>
                    ) : (
                      subRegions?.map((sub) => (
                        <label
                          key={sub.name}
                          className="flex justify-center items-center cursor-pointer"
                        >
                          <CustomCheckbox
                            label={sub.name}
                            checked={selectedSubRegions.some(
                              (item) => item.child.region_id === sub.region_id
                            )}
                            onChange={() => handleSubRegionChange(sub)}
                          />
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground-light dark:text-foreground-dark">
                  모델 선택
                </label>
                {/* <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-foreground-light dark:text-foreground-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="galaxy-s24">갤럭시 S24</option>
                  <option value="iphone-15">아이폰 15</option>
                  <option value="galaxy-z-flip5">갤럭시 Z 플립5</option>
                  <option value="iphone-14">아이폰 14</option>
                  <option value="galaxy-s23">갤럭시 S23</option>
                </select> */}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 mt-6 px-2">
            {/* 조건태그 있을 때만 보여줌 */}
            {selectedSubRegions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSubRegions.map(({ parent, child }) => (
                  <span
                    key={child.region_id}
                    className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full"
                  >
                    {parent.name} {child.name}
                    <button
                      onClick={() =>
                        setSelectedSubRegions((prev) =>
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
