import React, { useState, useEffect } from "react";
import type { Region, RegionWithParent } from "../../../shared/types";
import CustomCheckbox from "../components/CustomCheckbox";
import { FiX } from "react-icons/fi";

const OfferPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"region" | "model">("region");

  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [subRegions, setSubRegions] = useState<Region[]>([]);
  const [selectedSubRegions, setSelectedSubRegions] = useState<RegionWithParent[]>([]);

  const [selectedModel, setSelectedModel] = useState("all");

  const SERVER = import.meta.env.VITE_API_URL;

  // 시/도 지역 데이터 GET
  useEffect(() => {
    fetch(`${SERVER}/api/offer/regions?parentId=null`)
      .then((res) => res.json())
      .then(setRegions);
  }, [SERVER]);

  // 시/도 지역 선택 시 구/군(하위 지역) 지역 데이터 GET
  useEffect(() => {
    if (selectedRegion !== null) {
      const parentId = selectedRegion?.region_id;
      fetch(`${SERVER}/api/offer/regions?parentId=${parentId}`)
        .then((res) => res.json())
        .then((data) => {
          const all = { region_id: -parentId, parent_id: parentId, name: "전체" };
          setSubRegions([all, ...data]);
        });
    }
  }, [selectedRegion, SERVER]);

  const handleRegionChange = (selectedRegion: Region) => {
    setSelectedRegion(selectedRegion);
  };

  const handleSubRegionChange = (child: Region) => {
    if (!selectedRegion) return;

    setSelectedSubRegions((prev) => {
      const parentId = selectedRegion.region_id;

      const isAllSelected = child.region_id === -parentId;

      if (isAllSelected) {
        // 같은 parent_id를 가진 기존 항목들을 모두 제거하고 '전체'만 추가
        const filtered = prev.filter(
          (item) => item.parent.region_id !== parentId
        );
        return [...filtered, { parent: selectedRegion, child }];
      } else {
        const filtered = prev.filter(
          (item) =>
            !(item.parent.region_id === parentId && item.child.region_id === -parentId)
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
          return [...filtered, { parent: selectedRegion, child }];
        }
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-6 text-foreground-light dark:text-foreground-dark">
        가격 비교
      </h1>
      <div className="bg-white dark:bg-[#292929] rounded-t-lg shadow-lg p-0 mb-0">
        <div className="flex items-center gap-2 px-6 pt-4 pb-2">
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
                        checked={selectedRegion?.name === region.name}
                        onChange={() => handleRegionChange(region)}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="w-3/4 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {selectedRegion === null ? (
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
              <select
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
              </select>
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
    </div>
  );
};

export default OfferPage;
