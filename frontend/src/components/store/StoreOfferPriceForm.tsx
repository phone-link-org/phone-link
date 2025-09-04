import React, { useState, useEffect } from "react";
import type { CarrierDto, StoreOfferModel } from "../../../../shared/types";
import apiClient, { api } from "../../api/axios";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "sonner";
import { produce } from "immer";
import LoadingSpinner from "../LoadingSpinner";
import { ClipLoader } from "react-spinners";
import { useTheme } from "../../hooks/useTheme";

const offerTypes: { value: "MNP" | "CHG"; label: string }[] = [
  { value: "MNP", label: "번호이동" },
  { value: "CHG", label: "기기변경" },
];

const StoreOfferPriceForm: React.FC<{ storeId: number }> = ({ storeId }) => {
  const [carriers, setCarriers] = useState<CarrierDto[]>([]);
  const [offers, setOffers] = useState<StoreOfferModel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  // 통신사 정보 조회
  useEffect(() => {
    try {
      const fetchCarriers = async () => {
        const response = await api.get<CarrierDto[]>(`/phone/carriers`);
        setCarriers(response);
      };
      fetchCarriers();
    } catch (error) {
      console.error("Error fetching carriers:", error);
      toast.error("통신사 데이터을 불러오는 중 오류가 발생했습니다.");
    }
  }, []);

  // 시세표 조회
  useEffect(() => {
    const fetchPriceTableData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<StoreOfferModel[]>(
          `/store/${storeId}/offers`,
        );
        console.log(response);
        setOffers(response);
      } catch (error) {
        console.error("Error fetching price table data:", error);
        toast.error("가격 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPriceTableData();
  }, [storeId]);

  const handleRemoveRow = (modelId: number, storageId: number) => {
    setOffers((prev) =>
      prev
        .map((model) =>
          model.modelId === modelId
            ? {
                ...model,
                storages: model.storages.filter(
                  (storage) => storage.storageId !== storageId,
                ),
              }
            : model,
        )
        // 🔹 storages 가 비어 있으면 모델 자체도 제거
        .filter((model) => model.storages.length > 0),
    );
  };

  const handlePriceChange = (
    modelId: number,
    storageId: number,
    carrierId: number,
    offerType: "MNP" | "CHG",
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

        const offerTypeObj = carrier.offerTypes.find(
          (ot) => ot.offerType === offerType,
        );
        if (!offerTypeObj) return;

        offerTypeObj.price = price ?? null;
      }),
    );
  };

  const getCarrierImageUrl = (carrierName: string) => {
    try {
      return new URL(`/src/assets/images/${carrierName}.png`, import.meta.url)
        .href;
    } catch (error) {
      console.error(`Error loading image for carrier: ${carrierName}`, error);
      return "https://placehold.co/500x500";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (offers.length === 0) {
      toast.error("가격 정보를 입력 후 등록해주세요.");
      return;
    }

    setIsSubmitting(true); // 로딩 상태 활성화

    try {
      const result = await apiClient.post(`/store/${storeId}/offers`, {
        offers,
      });
      console.log(result);
      toast.success("가격 정보가 성공적으로 등록되었습니다.");
    } catch (error) {
      toast.error("데이터 제출에 실패했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false); // 로딩 상태 비활성화
    }
  };

  return (
    <>
      <LoadingSpinner
        isVisible={isSubmitting}
        title="가격 정보 등록 중"
        subtitle="잠시만 기다려주세요..."
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 bg-white dark:bg-[#292929] rounded-b-lg"
      >
        <div className="overflow-x-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 text-end">
            단위: 만원
          </p>
          <div className="h-[600px] overflow-y-auto border dark:border-gray-600 rounded-md">
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
                    offerTypes.map((type) => (
                      <th
                        key={`th-${carrier.id}-${type.value}`}
                        scope="col"
                        className="w-32 px-6 py-3 text-center text-sm font-medium text-white uppercase tracking-wider"
                      >
                        <img
                          src={getCarrierImageUrl(carrier.name)}
                          alt={carrier.name}
                          className="max-w-6 max-h-6 object-contain mx-auto mb-1"
                        />
                        {type.label}
                      </th>
                    )),
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
                    <td
                      colSpan={carriers.length * offerTypes.length + 3}
                      className="px-6 py-20"
                    >
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
                      등록된 가격 정보가 없습니다.
                    </td>
                  </tr>
                ) : (
                  offers.map((model, modelIndex) => {
                    return model.storages.map((storage, storageIndex) => {
                      return (
                        <tr
                          key={`${model.modelId}-${storage.storageId}`}
                          className={
                            modelIndex > 0 || storageIndex > 0
                              ? "border-t border-gray-200 dark:border-gray-600"
                              : ""
                          }
                        >
                          {/* 모델명: storage 개수만큼 rowSpan */}
                          {storageIndex === 0 && (
                            <td
                              rowSpan={model.storages.length}
                              className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white align-middle text-center border-r border-gray-200 dark:border-gray-600"
                            >
                              {model.modelName}
                            </td>
                          )}

                          {/* 스토리지명 */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 align-middle text-center border-r border-gray-200 dark:border-gray-600">
                            {storage.storage}
                          </td>

                          {/* carrier × offerType 가격들 */}
                          {storage.carriers.map((carrier) =>
                            carrier.offerTypes.map((offerType) => (
                              <td
                                key={`cell-${storage.storageId}-${carrier.carrierId}-${offerType.offerType}`}
                                className="px-4 py-4 whitespace-nowrap"
                              >
                                <input
                                  type="number"
                                  className="w-full px-1 py-1 border border-gray-300 rounded-md dark:bg-background-dark dark:text-white no-spinner placeholder:text-center focus:outline-none focus:ring-2 focus:ring-primary-light"
                                  value={offerType.price ?? ""}
                                  onChange={(e) =>
                                    handlePriceChange(
                                      model.modelId,
                                      storage.storageId,
                                      carrier.carrierId,
                                      offerType.offerType,
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                            )),
                          )}

                          {/* 삭제 버튼 */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRow(
                                  model.modelId,
                                  storage.storageId,
                                )
                              }
                              tabIndex={-1}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <FaTrashAlt className="text-red-400 dark:text-red-500 hover:opacity-70" />
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

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
      </form>
    </>
  );
};

export default StoreOfferPriceForm;
