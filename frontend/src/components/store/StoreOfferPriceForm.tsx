import React, { useState, useEffect } from "react";
import type { CarrierDto, StoreOfferModel } from "../../../../shared/types";
import apiClient from "../../api/axios";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import { produce } from "immer";
import LoadingSpinner from "../LoadingSpinner";
import { ClipLoader } from "react-spinners";
import { useTheme } from "../../hooks/useTheme";
import { OFFER_TYPES, type OfferType } from "../../../../shared/constants";
import AddOfferModal from "./AddOfferModal";

// 프론트엔드에서 사용할 기기 데이터 타입
interface StructuredDevice {
  id: number;
  name: string;
  models: {
    id: number;
    name: string;
    storages: {
      id: number;
      capacity: string;
    }[];
  }[];
}

const offerTypes: { value: OfferType; label: string }[] = [
  { value: OFFER_TYPES.MNP, label: "번호이동" },
  { value: OFFER_TYPES.CHG, label: "기기변경" },
];

const StoreOfferPriceForm: React.FC<{ storeId: number; isEditable?: boolean }> = ({ storeId, isEditable = true }) => {
  const [carriers, setCarriers] = useState<CarrierDto[]>([]);
  const [offers, setOffers] = useState<StoreOfferModel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [focusedCell, setFocusedCell] = useState<{
    modelId: number;
    storageId: number;
    carrierId: number;
    offerType: string;
  } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. 먼저 기존 시세표 조회
        const offersRes = await apiClient.get<{ data: StoreOfferModel[] }>(`/store/${storeId}/offers`);
        const existingOffers = offersRes.data.data;

        // 기존 시세표가 있는지 확인
        const hasExistingOffers = existingOffers && existingOffers.length > 0;

        let newOffers;

        if (hasExistingOffers) {
          // 기존 시세표가 있는 경우: offersRes만 사용
          newOffers = existingOffers;

          // 캐리어 정보만 별도로 조회 (기존 시세표에서 캐리어 정보 추출)
          const carriersFromOffers = existingOffers
            .flatMap((offer) => offer.storages)
            .flatMap((storage) => storage.carriers)
            .map((carrier) => ({ id: carrier.carrierId, name: carrier.carrierName }))
            .filter((carrier, index, self) => index === self.findIndex((c) => c.id === carrier.id));
          setCarriers(carriersFromOffers);
        } else {
          // 신규 매장인 경우: 전체 기기 목록과 캐리어 정보를 조회하여 시세표 구조 생성
          const [devicesRes, carriersRes] = await Promise.all([
            apiClient.get<{ data: StructuredDevice[] }>("/phone/devices-structured"),
            apiClient.get<{ data: CarrierDto[] }>("/phone/carriers"),
          ]);

          const allDevices = devicesRes.data.data;
          setCarriers(carriersRes.data.data);

          newOffers = allDevices.flatMap((manufacturer) =>
            manufacturer.models.map((model) => {
              return {
                manufacturerId: manufacturer.id,
                modelId: model.id,
                modelName: model.name,
                storages: model.storages.map((storage) => {
                  return {
                    storageId: storage.id,
                    storage: storage.capacity,
                    carriers: carriersRes.data.data.map((carrier) => {
                      return {
                        carrierId: carrier.id,
                        carrierName: carrier.name,
                        offerTypes: offerTypes.map((offerType) => {
                          return {
                            offerType: offerType.value,
                            price: null, // 신규 매장이므로 모든 가격은 null
                          };
                        }),
                      };
                    }),
                  };
                }),
              };
            }),
          );
        }

        setOffers(newOffers);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  const handleCellFocus = (modelId: number, storageId: number, carrierId: number, offerType: string) => {
    setFocusedCell({ modelId, storageId, carrierId, offerType });
  };

  const handleCellBlur = () => {
    setFocusedCell(null);
  };

  const handleRemoveRow = (modelId: number, storageId: number) => {
    setOffers((prev) =>
      prev
        .map((model) =>
          model.modelId === modelId
            ? {
                ...model,
                storages: model.storages.filter((storage) => storage.storageId !== storageId),
              }
            : model,
        )
        // storages 가 비어 있으면 모델 자체도 제거
        .filter((model) => model.storages.length > 0),
    );
  };

  const handleAddRow = () => {
    setIsAddModalOpen(true);
  };

  // 모달에서 확인 버튼 클릭 시 호출되는 핸들러
  const handleModalConfirm = (
    selectedModel: { id: number; name_ko: string; manufacturer_id: number },
    selectedStorages: { id: number; storage: string }[],
  ) => {
    // 선택된 모델과 용량들로 새로운 StoreOfferModel 생성
    const newOfferModel: StoreOfferModel = {
      manufacturerId: selectedModel.manufacturer_id,
      modelId: selectedModel.id,
      modelName: selectedModel.name_ko,
      storages: selectedStorages.map((storage) => ({
        storageId: storage.id,
        storage: storage.storage,
        carriers: carriers.map((carrier) => ({
          carrierId: carrier.id,
          carrierName: carrier.name,
          offerTypes: offerTypes.map((offerType) => ({
            offerType: offerType.value,
            price: null,
          })),
        })),
      })),
    };

    // setOffers를 사용해서 새로운 StoreOfferModel 추가
    setOffers((prevOffers) => [...prevOffers, newOfferModel]);

    toast.success(`${selectedModel.name_ko} 모델이 추가되었습니다.`);
  };

  const handlePriceChange = (
    modelId: number,
    storageId: number,
    carrierId: number,
    offerType: OfferType,
    newValue: string,
  ) => {
    const price = newValue === "" ? null : Number(newValue);

    setOffers(
      produce((draft) => {
        const model = draft.find((m) => m.modelId === modelId);
        if (!model) return;

        const storage = model.storages.find((s) => s.storageId === storageId);
        if (!storage) return;

        const carrier = storage.carriers.find((c) => c.carrierId === carrierId);
        if (!carrier) return;

        const offerTypeObj = carrier.offerTypes.find((ot) => ot.offerType === offerType);
        if (!offerTypeObj) return;

        offerTypeObj.price = price ?? null;
      }),
    );
  };

  const getCarrierImageUrl = (carrierName: string) => {
    try {
      return new URL(`/src/assets/images/${carrierName}.png`, import.meta.url).href;
    } catch {
      return "https://placehold.co/500x500";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 모든 가격 필드가 비어있는지 검사
    const hasAnyPrice = offers.some((model) =>
      model.storages.some((storage) =>
        storage.carriers.some((carrier) =>
          carrier.offerTypes.some((offer) => offer.price !== null && offer.price !== undefined),
        ),
      ),
    );

    if (!hasAnyPrice) {
      toast.error("가격을 하나 이상 입력해주세요.");
      return; // 데이터 제출 중단
    }

    setIsSubmitting(true);
    try {
      // 모든 price가 NULL인 모델-용량 조합을 제거
      const filteredOffers = offers
        .map((model) => ({
          ...model,
          storages: model.storages.filter((storage) => {
            // 해당 모델-용량 조합의 모든 price가 NULL인지 확인
            const allPricesNull = storage.carriers.every((carrier) =>
              carrier.offerTypes.every((offerType) => offerType.price === null),
            );
            return !allPricesNull; // 모든 price가 NULL이 아닌 경우만 유지
          }),
        }))
        .filter((model) => model.storages.length > 0); // storages가 비어있는 모델도 제거

      await apiClient.post(`/store/${storeId}/offers`, { offers: filteredOffers });
      toast.success("가격 정보가 성공적으로 등록되었습니다.");
    } catch (error) {
      toast.error("데이터 제출에 실패했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingSpinner isVisible={isSubmitting} title="가격 정보 등록 중" subtitle="잠시만 기다려주세요..." />

      <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-[#292929] rounded-b-lg">
        <div className="overflow-x-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 text-end">단위: 만원</p>
          <div className="h-[600px] overflow-y-auto border dark:border-gray-500 rounded-md">
            <table className="min-w-full table-fixed">
              <thead className="sticky top-0 bg-[#a8a8a8] dark:bg-[#737373]">
                <tr>
                  <th
                    scope="col"
                    className="w-48 px-6 py-3 text-center text-sm font-medium text-white uppercase tracking-wider"
                  >
                    모델
                  </th>
                  <th
                    scope="col"
                    className="w-24 px-6 py-3 text-center text-sm font-medium text-white uppercase tracking-wider"
                  >
                    용량
                  </th>
                  {carriers.map((carrier) =>
                    offerTypes.map((type) => {
                      const isFocused = focusedCell?.carrierId === carrier.id && focusedCell?.offerType === type.value;
                      return (
                        <th
                          key={`th-${carrier.id}-${type.value}`}
                          scope="col"
                          className={`w-32 px-6 py-3 text-center text-sm font-medium text-white uppercase tracking-wider transition-colors duration-200 ${
                            isFocused ? "bg-primary-light/50 dark:bg-primary-dark/50" : ""
                          }`}
                        >
                          <img
                            src={getCarrierImageUrl(carrier.name)}
                            alt={carrier.name}
                            className="max-w-6 max-h-6 object-contain mx-auto mb-1"
                          />
                          {type.label}
                        </th>
                      );
                    }),
                  )}
                  <th
                    scope="col"
                    className="w-20 px-6 py-3 text-center text-sm font-medium text-white dark:text-black uppercase tracking-wider"
                  ></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#292929]">
                {isLoading ? (
                  <tr>
                    <td colSpan={carriers.length * offerTypes.length + 3} className="px-6 py-20">
                      <div className="flex items-center justify-center">
                        <ClipLoader
                          size={48}
                          color={theme === "light" ? "#4F7942" : "#9DC183"}
                          loading={true}
                          className="animate-pulse"
                        />
                      </div>
                    </td>
                  </tr>
                ) : offers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={carriers.length * offerTypes.length + 3}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      표시할 기기 정보가 없습니다.
                    </td>
                  </tr>
                ) : (
                  offers.map((model, modelIndex) => {
                    return model.storages.map((storage, storageIndex) => {
                      return (
                        <tr
                          key={`${model.modelId}-${storage.storageId}`}
                          className={`${
                            modelIndex > 0 || storageIndex > 0 ? "border-t border-gray-200 dark:border-gray-500" : ""
                          } ${modelIndex % 2 === 0 ? "bg-white dark:bg-[#292929]" : "bg-gray-50 dark:bg-[#333333]"}`}
                        >
                          {/* 모델명: storage 개수만큼 rowSpan */}
                          {storageIndex === 0 && (
                            <td
                              rowSpan={model.storages.length}
                              className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white align-middle text-center border-r border-gray-200 dark:border-gray-500 transition-colors duration-200 ${
                                focusedCell?.modelId === model.modelId
                                  ? "bg-primary-light/40 dark:bg-primary-dark/40"
                                  : ""
                              }`}
                            >
                              {model.modelName}
                            </td>
                          )}

                          {/* 스토리지명 */}
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 align-middle text-center border-r border-gray-200 dark:border-gray-500 transition-colors duration-200 ${
                              focusedCell?.modelId === model.modelId && focusedCell?.storageId === storage.storageId
                                ? "bg-primary-light/40 dark:bg-primary-dark/40"
                                : ""
                            }`}
                          >
                            {storage.storage}
                          </td>
                          {carriers.map((carrier) =>
                            offerTypes.map((offerType) => {
                              const carrierData = storage.carriers.find((c) => c.carrierId === carrier.id);
                              const offerTypeData = carrierData?.offerTypes.find(
                                (ot) => ot.offerType === offerType.value,
                              );
                              return (
                                <td
                                  key={`cell-${storage.storageId}-${carrier.id}-${offerType.value}`}
                                  className="px-4 py-4 whitespace-nowrap"
                                >
                                  <input
                                    type="number"
                                    className={`w-full px-1 py-1 border border-gray-300 dark:border-gray-500 rounded-md dark:bg-background-dark dark:text-white no-spinner placeholder:text-center focus:outline-none focus:ring-2 focus:ring-primary-light ${!isEditable ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}`}
                                    value={offerTypeData?.price ?? ""}
                                    onChange={(e) =>
                                      handlePriceChange(
                                        model.modelId,
                                        storage.storageId,
                                        carrier.id,
                                        offerType.value,
                                        e.target.value,
                                      )
                                    }
                                    onFocus={() =>
                                      handleCellFocus(model.modelId, storage.storageId, carrier.id, offerType.value)
                                    }
                                    onBlur={handleCellBlur}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    disabled={!isEditable}
                                  />
                                </td>
                              );
                            }),
                          )}

                          {/* 삭제 버튼 - 편집 가능할 때만 표시 */}
                          {isEditable && (
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(model.modelId, storage.storageId)}
                                tabIndex={-1}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <FaTrashAlt className="text-red-400 dark:text-red-500 hover:opacity-70" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    });
                  })
                )}

                {/* 추가하기 버튼 행 */}
                {isEditable && (
                  <tr>
                    <td
                      colSpan={2 + carriers.length * offerTypes.length + 1}
                      className="p-0 border-t border-gray-200 dark:border-gray-500"
                    >
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium text-primary-light dark:text-primary-dark hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 transition-colors duration-200 focus:outline-none"
                      >
                        <FaPlus />
                        추가하기
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 저장 버튼 - 편집 가능할 때만 표시 */}
        {isEditable && (
          <div>
            <button
              type="submit"
              disabled={isSubmitting} // 제출 중일 때 버튼 비활성화
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium transition-all duration-200 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed text-white dark:text-gray-600"
                  : "text-white dark:text-black bg-primary-light dark:bg-primary-dark hover:bg-primary-dark"
              }`}
            >
              {isSubmitting ? "등록 중..." : "등록"}
            </button>
          </div>
        )}
      </form>

      {/* 추가하기 모달 */}
      <AddOfferModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleModalConfirm}
        storeId={storeId}
      />
    </>
  );
};

export default StoreOfferPriceForm;
