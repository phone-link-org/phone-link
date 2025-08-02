import React, { useEffect, useState } from "react";
import type {
  PhoneManufacturer,
  PhoneModel,
  PhoneStorage,
} from "../../../../shared/types";
import CustomCheckbox from "../CustomCheckbox";
import type {
  ManufacturerModelCondition,
  ModelCondition,
  OfferSearchCondition,
} from "../../../../shared/offer_types";

interface ModelSelectorProps {
  setOfferSearchCondition: React.Dispatch<
    React.SetStateAction<OfferSearchCondition | null>
  >;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  setOfferSearchCondition,
}) => {
  const [manufacturers, setManufacturers] = useState<PhoneManufacturer[]>([]);
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [storages, setStorages] = useState<PhoneStorage[]>([]);

  const [selectedManufacturer, setSelectedManufacturer] =
    useState<PhoneManufacturer | null>(null);
  const [lastSelectedModel, setLastSelectedModel] = useState<PhoneModel | null>(
    null
  );
  const [selectedModels, setSelectedModels] = useState<PhoneModel[]>([]);
  const [selectedStorages, setSelectedStorages] = useState<PhoneStorage[]>([]);

  const [modelConditions, setModelConditions] = useState<ModelCondition[]>([]);
  const [manufacturerModelConditions, setManufacturerModelConditions] =
    useState<ManufacturerModelCondition[]>([]);

  const SERVER = import.meta.env.VITE_API_URL;

  // 제조사 목록 조회 (최초 1회만)
  useEffect(() => {
    fetch(`${SERVER}/api/offer/phone-manufacturers`)
      .then((res) => res.json())
      .then(setManufacturers);
  }, [SERVER]);

  // 모델 목록 조회 (제조사 선택 시)
  useEffect(() => {
    if (selectedManufacturer !== null) {
      fetch(
        `${SERVER}/api/offer/phone-models?manufacturerId=${selectedManufacturer.id}`
      )
        .then((res) => res.json())
        .then((data) => {
          const all = {
            id: -selectedManufacturer.id,
            manufacturer_id: selectedManufacturer.id,
            name_ko: "전체",
            name_en: "All",
          };
          setModels([all, ...data]);
        });
    }
  }, [selectedManufacturer, SERVER]);

  // 사용자가 마지막으로 선택한 모델의 저장소 목록 조회
  useEffect(() => {
    if (lastSelectedModel !== null && lastSelectedModel.id > 0) {
      fetch(
        `${SERVER}/api/offer/phone-storages?modelId=${lastSelectedModel.id}`
      )
        .then((res) => res.json())
        .then((data) => {
          const all = {
            id: -lastSelectedModel.id,
            storage: "전체",
          };
          setStorages([all, ...data]);
        });
    }
  }, [lastSelectedModel, SERVER]);

  useEffect(() => {
    if (!modelConditions.length) {
      setManufacturerModelConditions([]);
      return;
    }

    if (!selectedManufacturer) return;

    const manufacturerMap: Record<number, ModelCondition[]> = {};

    modelConditions.forEach((condition) => {
      const manufacturerId = selectedManufacturer?.id;
      if (!manufacturerMap[manufacturerId]) {
        manufacturerMap[manufacturerId] = [];
      }

      manufacturerMap[manufacturerId].push(condition);
    });

    const grouped: ManufacturerModelCondition[] = Object.entries(
      manufacturerMap
    ).map(([manufacturerId, models]) => ({
      manufacturer: Number(manufacturerId),
      model: models,
    }));

    setManufacturerModelConditions(grouped);
  }, [modelConditions]);

  useEffect(() => {
    console.log(manufacturerModelConditions);
  }, [manufacturerModelConditions]);

  const handleModelChange = (model: PhoneModel) => {
    //-------------------lastSelectedModel & storages control-------------------//
    const isAlreadySelected = selectedModels.some((m) => m.id === model.id);
    setLastSelectedModel(isAlreadySelected ? null : model);
    if (isAlreadySelected) setStorages([]);
    //--------------------------------------------------------------------------//

    //------------------------modelConditions control------------------------//
    setModelConditions((prev) => {
      const exists = prev.find((cond) => cond.id === model.id);
      if (exists) {
        // 이미 있으면 제거 (체크 해제)
        return prev.filter((cond) => cond.id !== model.id);
      } else {
        // 없으면 추가 (빈 storage로 초기화)
        return [...prev, { id: model.id, storageId: [] }];
      }
    });
    //-----------------------------------------------------------------------//

    setSelectedModels((prev) => {
      const isAllSelected =
        selectedManufacturer !== null && model.id === -selectedManufacturer.id;

      if (isAllSelected) {
        // 선택된 제조사의 모델들을 제거하고 '전체'만 추가
        const filtered = prev.filter(
          (item) => item.manufacturer_id !== selectedManufacturer?.id
        );
        return [...filtered, model];
      } else {
        // 기존 '전체' 선택 모델 제거
        const filtered = prev.filter(
          (item) =>
            !(
              item.manufacturer_id === selectedManufacturer?.id &&
              item.id === -selectedManufacturer.id
            )
        );

        const alreadySelected = filtered.find((item) => item.id === model.id);

        if (alreadySelected) {
          return filtered.filter((item) => item.id !== model.id); // 선택 해제
        } else {
          return [...filtered, model]; // 선택 추가
        }
      }
    });
  };

  const handleStorageChange = (storage: PhoneStorage) => {
    // selectedStorages 업데이트
    setSelectedStorages((prev) => {
      // '전체' storage인지 확인 (음수 ID)
      const isAllStorage = storage.id < 0;

      if (isAllStorage) {
        // '전체' 선택 시: 기존 모든 storage 제거하고 '전체'만 추가
        return [storage];
      } else {
        // 일반 storage 선택 시
        const isCurrentlySelected = prev.some((s) => s.id === storage.id);
        const hasAllStorage = prev.some((s) => s.id < 0); // '전체'가 현재 선택되어 있는지

        if (isCurrentlySelected) {
          // 현재 선택된 storage를 해제
          return prev.filter((s) => s.id !== storage.id);
        } else {
          // 새로운 storage 선택
          if (hasAllStorage) {
            // '전체'가 선택되어 있다면 '전체' 제거하고 새 storage 추가
            return [...prev.filter((s) => s.id >= 0), storage];
          } else {
            // 일반적인 추가
            return [...prev, storage];
          }
        }
      }
    });

    // modelConditions 업데이트
    if (!lastSelectedModel) return;

    setModelConditions((prev) => {
      return prev.map((cond) => {
        if (cond.id !== lastSelectedModel.id) return cond;

        const isSelected = cond.storageId.includes(storage.id);

        // '전체' storage 처리
        if (storage.id < 0) {
          // '전체' 선택 시: 모든 storage ID를 '전체' ID로 변경
          return { ...cond, storageId: [storage.id] };
        } else {
          // 일반 storage 처리
          const hasAllStorage = cond.storageId.some((id) => id < 0);

          if (isSelected) {
            // 선택 해제
            const updatedStorage = cond.storageId.filter(
              (s) => s !== storage.id
            );
            return { ...cond, storageId: updatedStorage };
          } else {
            // 선택 추가
            if (hasAllStorage) {
              // '전체'가 있으면 '전체' 제거하고 새 storage 추가
              const filteredStorage = cond.storageId.filter((id) => id >= 0);
              return { ...cond, storageId: [...filteredStorage, storage.id] };
            } else {
              // 일반적인 추가
              return { ...cond, storageId: [...cond.storageId, storage.id] };
            }
          }
        }
      });
    });
  };

  return (
    <div className="flex gap-6">
      <div className="w-1/5 max-h-60 min-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
        <div className="flex flex-col gap-2">
          {manufacturers.map((manufacturer) => (
            <label
              key={manufacturer.id}
              className="flex justify-center items-center cursor-pointer"
            >
              <CustomCheckbox
                label={manufacturer.name_ko}
                checked={selectedManufacturer === manufacturer}
                onChange={() => setSelectedManufacturer(manufacturer)}
              />
            </label>
          ))}
        </div>
      </div>
      <div className="w-3/5 max-h-60 min-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {selectedManufacturer === null ? (
            <div className="text-gray-400 text-xs">
              제조사를 먼저 선택하세요.
            </div>
          ) : models?.length === 0 ? (
            <span className="text-gray-400 text-xs">
              데이터가 존재하지 않습니다.
            </span>
          ) : (
            models?.map((model) => (
              <label
                key={model.id}
                className="flex justify-center items-center cursor-pointer"
              >
                <CustomCheckbox
                  label={model.name_ko}
                  checked={selectedModels.some((item) => item === model)}
                  onChange={() => handleModelChange(model)}
                />
              </label>
            ))
          )}
        </div>
      </div>
      <div className="w-1/5 max-h-60 min-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
        <div className="flex flex-col gap-2">
          {storages.map((data) => (
            <label
              key={`${lastSelectedModel?.id}-${data.id}`}
              className="flex justify-center items-center cursor-pointer"
            >
              <CustomCheckbox
                label={data.storage}
                checked={selectedStorages.some((item) => item === data)}
                onChange={() => handleStorageChange(data)}
              />
            </label>
          ))}
        </div>
      </div>
      {/* <div className="w-1/5 max-h-60 min-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="flex flex-col gap-3">
            {storages.map((storage) => (
              <label
                key={storage}
                className="flex justify-center items-center cursor-pointer"
              >
                <CustomCheckbox
                  label={storage}
                  checked={selectedStorages.some((item) => item === storage)}
                  onChange={() =>
                    setSelectedStorages((prev) =>
                      prev.includes(storage)
                        ? prev.filter((s) => s !== storage)
                        : [...prev, storage]
                    )
                  }
                />
              </label>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ModelSelector;
