import React, { useEffect, useState } from "react";
import type {
  OfferModelDto,
  PhoneManufacturerDto,
  PhoneStorageDto,
} from "../../../../shared/types";
import CustomCheckbox from "../CustomCheckbox";
import { api } from "../../api/axios";
import { toast } from "sonner";

interface ModelSelectorProps {
  selectedModels: OfferModelDto[];
  onSelectedModelsChange: (models: OfferModelDto[]) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModels,
  onSelectedModelsChange,
}) => {
  const [manufacturers, setManufacturers] = useState<PhoneManufacturerDto[]>(
    [],
  );
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<PhoneManufacturerDto | null>(null);
  const [models, setModels] = useState<OfferModelDto[]>([]);
  const [lastSelectedModel, setLastSelectedModel] =
    useState<OfferModelDto | null>(null);
  const [storages, setStorages] = useState<PhoneStorageDto[]>([]);

  // 제조사 목록 조회 (최초 1회만)
  useEffect(() => {
    try {
      const fetchManufacturers = async () => {
        const response =
          await api.get<PhoneManufacturerDto[]>(`/phone/manufacturers`);
        setManufacturers(response);
      };
      fetchManufacturers();
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      toast.error("제조사 데이터을 불러오는 중 오류가 발생했습니다.");
    }
  }, []);

  // 모델 목록 조회 (제조사 선택 시)
  useEffect(() => {
    try {
      if (selectedManufacturer) {
        const fetchModels = async () => {
          const response = await api.get<OfferModelDto[]>(`/phone/models`, {
            params: {
              manufacturerId: selectedManufacturer.id,
            },
          });

          const allOption: OfferModelDto = {
            manufacturerId: selectedManufacturer.id,
            modelId: -selectedManufacturer.id,
            name: "전체",
            storages: [],
          };
          setModels([allOption, ...response]);
        };
        fetchModels();
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("핸드폰 기종 데이터을 불러오는 중 오류가 발생했습니다.");
    }
  }, [selectedManufacturer]);

  // 사용자가 마지막으로 선택한 모델의 저장소 목록 조회
  useEffect(() => {
    try {
      if (lastSelectedModel && lastSelectedModel.modelId > 0) {
        const fetchStorages = async () => {
          const response = await api.get<PhoneStorageDto[]>(`/phone/storages`, {
            params: {
              modelId: lastSelectedModel.modelId,
            },
          });
          setStorages(response);
        };
        fetchStorages();
      }
    } catch (error) {
      console.error("Error fetching storages:", error);
      toast.error("용량 데이터을 불러오는 중 오류가 발생했습니다.");
    }
  }, [lastSelectedModel]);

  // 제조사 선택 시
  const handleManufacturerChange = (manufacturer: PhoneManufacturerDto) => {
    setSelectedManufacturer(manufacturer);
    setStorages([]);
    setLastSelectedModel(null);
  };

  // 모델 선택 시
  const handleModelChange = (clickedModel: OfferModelDto) => {
    // 1. 모델 선택/해제 로직
    const isAlreadySelected = selectedModels.some(
      (item) => item.modelId === clickedModel.modelId,
    );

    // 3. lastSelectedModel 및 storages 상태 업데이트
    if (isAlreadySelected) {
      setLastSelectedModel(null);
      setStorages([]);
    } else {
      setLastSelectedModel(clickedModel);

      // '전체' 모델 선택 시 storages 비우기
      if (clickedModel.modelId < 0) {
        setStorages([]);
      }
      // 일반 모델 선택 시 용량 데이터 요청은 useEffect에서 자동으로 처리됨
    }

    // 4. selectedModels 업데이트
    let newSelectedModels: OfferModelDto[];

    if (isAlreadySelected) {
      // 모델 선택 해제
      newSelectedModels = selectedModels.filter(
        (item) => item.modelId !== clickedModel.modelId,
      );
    } else {
      // 모델 선택 추가
      const isAllSelected = clickedModel.modelId < 0; // '전체' 모델인지 확인

      if (isAllSelected) {
        const manufacturerName = selectedManufacturer?.name_ko || "";
        const allModelWithCustomName: OfferModelDto = {
          ...clickedModel,
          name: `${manufacturerName} 전체`,
        };

        newSelectedModels = [
          ...selectedModels.filter(
            (item) => item.manufacturerId !== clickedModel.manufacturerId,
          ),
          allModelWithCustomName,
        ];
      } else {
        // 일반 모델 선택 시: 기존 '전체' 제거하고 새 모델 추가
        newSelectedModels = [
          ...selectedModels.filter(
            (item) =>
              !(
                item.manufacturerId === clickedModel.manufacturerId &&
                item.modelId < 0
              ),
          ),
          clickedModel,
        ];
      }
    }

    onSelectedModelsChange(newSelectedModels);
  };

  // 용량 선택 시
  const handleStorageChange = (storage: PhoneStorageDto) => {
    if (!lastSelectedModel) return;

    // 1. 현재 선택된 모델 찾기
    const currentModelIndex = selectedModels.findIndex(
      (item) => item.modelId === lastSelectedModel.modelId,
    );

    if (currentModelIndex === -1) return; // 모델이 선택되지 않은 경우

    const currentModel = selectedModels[currentModelIndex];
    const currentStorages = currentModel.storages || [];

    // 2. 선택된 storage가 이미 있는지 확인
    const isAlreadySelected = currentStorages.some((s) => s.id === storage.id);

    // 3. 새로운 storages 배열 생성
    let newStorages: PhoneStorageDto[];

    if (isAlreadySelected) {
      // 선택 해제: 해당 storage만 제거
      newStorages = currentStorages.filter((s) => s.id !== storage.id);
    } else {
      // 선택 추가
      const isAllStorage = storage.id < 0; // '전체' storage인지 확인

      if (isAllStorage) {
        // '전체' 선택 시: 기존 모든 storage 제거하고 '전체'만 추가
        newStorages = [storage];
      } else {
        // 일반 storage 선택 시
        const hasAllStorage = currentStorages.some((s) => s.id < 0);

        if (hasAllStorage) {
          // '전체'가 선택되어 있다면 '전체' 제거하고 새 storage 추가
          newStorages = [...currentStorages.filter((s) => s.id >= 0), storage];
        } else {
          // 일반적인 추가
          newStorages = [...currentStorages, storage];
        }
      }
    }

    // 4. selectedModels 업데이트 (불변성 유지)
    const updatedModels = [...selectedModels];
    updatedModels[currentModelIndex] = {
      ...currentModel,
      storages: newStorages,
    };

    onSelectedModelsChange(updatedModels);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/5 max-h-60 min-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
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
      <div className="w-full md:w-3/5 max-h-60 min-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                key={model.modelId}
                className="flex justify-center items-center cursor-pointer"
              >
                <CustomCheckbox
                  label={model.name}
                  checked={selectedModels.some(
                    (item) => item.modelId == model.modelId,
                  )}
                  onChange={() => handleModelChange(model)}
                  customStyle="text-sm w-[150px]"
                />
              </label>
            ))
          )}
        </div>
      </div>
      <div className="w-full md:w-1/5 max-h-60 min-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
        <div className="flex flex-col gap-2">
          {storages.map((data) => (
            <label
              key={`${lastSelectedModel?.modelId}-${data.id}`}
              className="flex justify-center items-center cursor-pointer"
            >
              <CustomCheckbox
                label={data.storage}
                checked={(() => {
                  const currentCondition = selectedModels.find(
                    (item) => item.modelId === lastSelectedModel?.modelId,
                  );
                  return (
                    currentCondition?.storages?.some(
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
    </div>
  );
};

export default ModelSelector;
