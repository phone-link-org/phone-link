import React, { useState, useEffect } from "react";
import type { Region, RegionCondition } from "../../../../shared/types";
import CustomCheckbox from "../CustomCheckbox";

interface RegionSelectorProps {
  regionConditions: RegionCondition[];
  onRegionConditionsChange: (conditions: RegionCondition[]) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  regionConditions,
  onRegionConditionsChange,
}) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [subRegions, setSubRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const SERVER = import.meta.env.VITE_API_URL;

  // 시/도 지역 데이터 GET
  useEffect(() => {
    fetch(`${SERVER}/api/offer/regions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: null }),
    })
      .then((res) => res.json())
      .then(setRegions);
  }, [SERVER]);

  // 시/도 지역 선택 시 구/군(하위 지역) 지역 데이터 GET
  useEffect(() => {
    if (selectedRegion !== null) {
      const parentId = selectedRegion?.region_id;
      fetch(`${SERVER}/api/offer/regions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId }),
      })
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
  }, [selectedRegion, SERVER]);

  const handleSubRegionChange = (child: Region) => {
    if (!selectedRegion) return;

    const parentId = selectedRegion.region_id;
    const isAllSelected = child.region_id === -parentId;

    if (isAllSelected) {
      // 같은 parent_id를 가진 기존 항목들을 모두 제거하고 '전체'만 추가
      const filtered = regionConditions.filter(
        (item) => item.parent.region_id !== parentId,
      );
      onRegionConditionsChange([
        ...filtered,
        { parent: selectedRegion, child },
      ]);
    } else {
      const filtered = regionConditions.filter(
        (item) =>
          !(
            item.parent.region_id === parentId &&
            item.child.region_id === -parentId
          ),
      );

      const alreadySelected = filtered.find(
        (item) => item.child.region_id === child.region_id,
      );

      if (alreadySelected) {
        // 이미 선택된 항목이면 제거
        onRegionConditionsChange(
          filtered.filter((item) => item.child.region_id !== child.region_id),
        );
      } else {
        // 새로운 항목 추가
        onRegionConditionsChange([
          ...filtered,
          { parent: selectedRegion, child },
        ]);
      }
    }
  };
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/4 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
        <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
          {regions.map((region) => (
            <label
              key={region.name}
              className="flex justify-center items-center cursor-pointer"
            >
              <CustomCheckbox
                label={region.name}
                checked={selectedRegion?.name === region.name}
                onChange={() => setSelectedRegion(region)}
                customStyle="text-sm w-[81px]"
              />
            </label>
          ))}
        </div>
      </div>
      <div className="w-full md:w-3/4 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {selectedRegion === null ? (
            <div className="text-gray-400 text-xs">
              시/도를 먼저 선택하세요.
            </div>
          ) : subRegions?.length === 0 ? (
            <span className="text-gray-400 text-xs">구/군 데이터 없음</span>
          ) : (
            subRegions?.map((sub) => (
              <label
                key={sub.name}
                className="flex justify-center items-center cursor-pointer"
              >
                <CustomCheckbox
                  label={sub.name}
                  checked={regionConditions.some(
                    (item) => item.child.region_id === sub.region_id,
                  )}
                  onChange={() => handleSubRegionChange(sub)}
                  customStyle="text-sm w-[81px]"
                />
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RegionSelector;
