import React, { useState, useEffect } from "react";
import type { RegionCondition, Region } from "../../../../shared/types";
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
    })
      .then((res) => res.json())
      .then(setRegions);
  }, [SERVER]);

  // 시/도 지역 선택 시 구/군(하위 지역) 지역 데이터 GET
  useEffect(() => {
    if (selectedRegion !== null) {
      const sidoCode = selectedRegion?.code.substring(
        0,
        selectedRegion.code.substring(0, 2) === "36" ? 4 : 2, // 세종(36)은 다른 지역과 다르게 고유코드가 4임
      );

      fetch(`${SERVER}/api/offer/regions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sidoCode }),
      })
        .then((res) => res.json())
        .then((data) => {
          const all: Region = {
            code: "-" + selectedRegion?.code,
            name: "전체",
            is_active: true,
            latitude: 0,
            longitude: 0,
          };
          setSubRegions([all, ...data]);
        });
    }
  }, [selectedRegion, SERVER]);

  const handleSubRegionChange = (selectedChild: Region) => {
    if (!selectedRegion) return;

    const parentCode = selectedRegion.code;
    const isAllSelected = selectedChild.code === "-" + parentCode;
    const alreadyExists = regionConditions.some(
      (item) => item.child.code === selectedChild.code,
    );

    if (isAllSelected) {
      // '전체'를 선택한 경우, 같은 부모를 가진 다른 하위 지역들을 모두 제거하고 '전체'만 추가합니다.
      const others = regionConditions.filter(
        (item) => item.parent.code !== parentCode,
      );
      onRegionConditionsChange([
        ...others,
        { parent: selectedRegion, child: selectedChild },
      ]);
    } else if (alreadyExists) {
      // 이미 선택된 항목을 다시 클릭한 경우, 해당 항목을 제거합니다.
      // '전체' 항목도 함께 제거합니다.
      onRegionConditionsChange(
        regionConditions.filter(
          (item) =>
            item.child.code !== selectedChild.code &&
            item.child.code !== "-" + parentCode,
        ),
      );
    } else {
      // 새로운 하위 지역을 선택한 경우, '전체' 항목을 제거하고 새 항목을 추가합니다.
      const others = regionConditions.filter(
        (item) => item.child.code !== "-" + parentCode,
      );
      onRegionConditionsChange([
        ...others,
        { parent: selectedRegion, child: selectedChild },
      ]);
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
                    (item) => item.child.code === sub.code,
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
