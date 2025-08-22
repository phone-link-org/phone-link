import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  ModelCondition,
  PhoneManufacturer,
  PhoneModel,
  PhoneStorage,
} from "../../../../shared/types";
import CustomCheckbox from "../CustomCheckbox";

interface ModelSelectorProps {
  modelConditions: ModelCondition[];
  onModelConditionsChange: (conditions: ModelCondition[]) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  modelConditions,
  onModelConditionsChange,
}) => {
  const [manufacturers, setManufacturers] = useState<PhoneManufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<PhoneManufacturer | null>(null);
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [lastSelectedModel, setLastSelectedModel] = useState<PhoneModel | null>(
    null,
  );
  const [storages, setStorages] = useState<PhoneStorage[]>([]);

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
      fetch(`${SERVER}/api/offer/phone-models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manufacturerId: selectedManufacturer.id }),
      })
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
        `${SERVER}/api/offer/phone-storages?modelId=${lastSelectedModel.id}`,
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

  const handleManufacturerChange = (manufacturer: PhoneManufacturer) => {
    //TODO: 모델만 선택한 후 제조사 변경 시 에러 메시지 출력 + return;

    setSelectedManufacturer(manufacturer);
    setStorages([]);
    setLastSelectedModel(null);
  };

  const handleModelChange = (model: PhoneModel) => {
    const isAlreadySelected = modelConditions.some(
      (condition) => condition.model.id === model.id,
    );

    // 현재 선택된 모델이 있고, 해당 모델의 용량이 선택되지 않았는지 확인
    if (lastSelectedModel && !isAlreadySelected) {
      // lastSelectedModel과 model의 ID 부호가 같을 때만 용량 검증 수행
      const isSameSign =
        (lastSelectedModel.id > 0 && model.id > 0) ||
        (lastSelectedModel.id < 0 && model.id < 0);

      if (isSameSign) {
        const currentCondition = modelConditions.find(
          (condition) => condition.model.id === lastSelectedModel.id,
        );

        // 용량이 선택되지 않았거나 빈 배열인 경우
        if (
          !currentCondition?.storage ||
          currentCondition.storage.length === 0
        ) {
          toast.error(`${lastSelectedModel.name_ko}의 용량을 선택해주세요.`);
          return; // 모델 선택을 중단
        }
      }
    }

    // lastSelectedModel & storages control
    setLastSelectedModel(isAlreadySelected ? null : model);
    if (isAlreadySelected) {
      setStorages([]);
    }

    const isAllSelected =
      selectedManufacturer !== null && model.id === -selectedManufacturer.id;

    if (isAllSelected) {
      // 선택된 제조사의 모델들을 제거하고 '전체'만 추가
      const filteredConditions = modelConditions.filter(
        (condition) =>
          condition.model.manufacturer_id !== selectedManufacturer?.id,
      );
      onModelConditionsChange([...filteredConditions, { model }]);
    } else {
      // 기존 '전체' 선택 모델 제거
      const filteredConditions = modelConditions.filter(
        (condition) =>
          !(
            condition.model.manufacturer_id === selectedManufacturer?.id &&
            condition.model.id === -selectedManufacturer.id
          ),
      );

      const alreadySelected = filteredConditions.find(
        (condition) => condition.model.id === model.id,
      );

      if (alreadySelected) {
        // 모델 선택 해제
        onModelConditionsChange(
          filteredConditions.filter(
            (condition) => condition.model.id !== model.id,
          ),
        );
      } else {
        // 모델 선택 추가
        onModelConditionsChange([...filteredConditions, { model }]);
      }
    }
  };

  const handleStorageChange = (storage: PhoneStorage) => {
    if (!lastSelectedModel) return;

    // 현재 선택된 모델의 storage 정보 가져오기
    const currentCondition = modelConditions.find(
      (condition) => condition.model.id === lastSelectedModel.id,
    );
    const currentStorages = currentCondition?.storage || [];

    // '전체' storage인지 확인 (음수 ID)
    const isAllStorage = storage.id < 0;

    let newStorages: PhoneStorage[];

    if (isAllStorage) {
      // '전체' 선택 시: 기존 모든 storage 제거하고 '전체'만 추가
      newStorages = [storage];
    } else {
      // 일반 storage 선택 시
      const isCurrentlySelected = currentStorages.some(
        (s) => s.id === storage.id,
      );
      const hasAllStorage = currentStorages.some((s) => s.id < 0); // '전체'가 현재 선택되어 있는지

      if (isCurrentlySelected) {
        // 현재 선택된 storage를 해제
        newStorages = currentStorages.filter((s) => s.id !== storage.id);
      } else {
        // 새로운 storage 선택
        if (hasAllStorage) {
          // '전체'가 선택되어 있다면 '전체' 제거하고 새 storage 추가
          newStorages = [...currentStorages.filter((s) => s.id >= 0), storage];
        } else {
          // 일반적인 추가
          newStorages = [...currentStorages, storage];
        }
      }
    }

    // modelConditions 업데이트
    const updatedConditions = modelConditions.map((condition) => {
      if (condition.model.id === lastSelectedModel.id) {
        return {
          ...condition,
          storage: newStorages,
        };
      }
      return condition;
    });

    onModelConditionsChange(updatedConditions);
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
                onChange={() => handleManufacturerChange(manufacturer)}
                customStyle="text-sm w-[150px]"
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
                  checked={modelConditions.some(
                    (item) => item.model.id == model.id,
                  )}
                  onChange={() => handleModelChange(model)}
                  customStyle="text-sm w-[150px]"
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
                checked={(() => {
                  const currentCondition = modelConditions.find(
                    (condition) => condition.model.id === lastSelectedModel?.id,
                  );
                  return (
                    currentCondition?.storage?.some(
                      (item) => item.id === data.id,
                    ) || false
                  );
                })()}
                onChange={() => handleStorageChange(data)}
                customStyle="text-sm w-[150px]"
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
