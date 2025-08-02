import React, { useState, useEffect } from "react";
import type { Region, RegionWithParent } from "../../../../shared/types";
import type {
  OfferSearchCondition,
  RegionCondition,
} from "../../../../shared/offer_types";
import CustomCheckbox from "../CustomCheckbox";

interface RegionSelectorProps {
  selectedSubRegions: RegionWithParent[];
  setSelectedSubRegions: React.Dispatch<
    React.SetStateAction<RegionWithParent[]>
  >;
  setOfferSearchCondition: React.Dispatch<
    React.SetStateAction<OfferSearchCondition | null>
  >;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedSubRegions,
  setSelectedSubRegions,
  setOfferSearchCondition,
}) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [subRegions, setSubRegions] = useState<Region[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<Region | null>(null);

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

    setOfferSearchCondition((prev) => {
      const current = prev || {
        region: [],
        model: [],
        offerType: [],
        carrier: [],
      };

      const parentId = selectedRegions.region_id;
      const isAllSelected = child.region_id === -parentId;

      if (isAllSelected) {
        // 같은 parent_id를 가진 기존 항목들을 모두 제거하고 '전체'만 추가
        const filtered = current.region.filter(
          (item) => item.parent !== parentId
        );
        return {
          ...current,
          region: [...filtered, { parent: parentId, child: [child.region_id] }],
        };
      } else {
        const filtered = current.region.filter(
          (item) =>
            !(item.parent === parentId && item.child.includes(-parentId))
        );

        const existingParent = filtered.find(
          (item) => item.parent === parentId
        );

        if (existingParent) {
          // 같은 parent가 이미 있으면 child 배열 업데이트
          const isChildSelected = existingParent.child.includes(
            child.region_id
          );

          if (isChildSelected) {
            // 선택 해제
            const updatedChild = existingParent.child.filter(
              (id) => id !== child.region_id
            );
            if (updatedChild.length === 0) {
              // child가 없으면 parent도 제거
              return {
                ...current,
                region: filtered.filter((item) => item.parent !== parentId),
              };
            } else {
              return {
                ...current,
                region: filtered.map((item) =>
                  item.parent === parentId
                    ? { ...item, child: updatedChild }
                    : item
                ),
              };
            }
          } else {
            // 선택 추가
            return {
              ...current,
              region: filtered.map((item) =>
                item.parent === parentId
                  ? { ...item, child: [...item.child, child.region_id] }
                  : item
              ),
            };
          }
        } else {
          // 새로운 parent 추가
          return {
            ...current,
            region: [
              ...filtered,
              { parent: parentId, child: [child.region_id] },
            ],
          };
        }
      }
    });

    // 기존 selectedSubRegions 로직도 유지 (UI 표시용)
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
            <span className="text-gray-400 text-xs">구/군 데이터 없음</span>
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
  );
};

export default RegionSelector;
