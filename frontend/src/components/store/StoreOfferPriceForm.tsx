import React, { useState, useEffect, useMemo } from "react";
import type {
  CarrierDto,
  PriceInput,
  PriceSubmissionData,
  StoreOfferPriceFormData,
} from "../../../../shared/types";
import apiClient, { api } from "../../api/axios";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "sonner";

const offerTypes = [
  { value: "MNP", label: "번호이동" },
  { value: "CHG", label: "기기변경" },
];

interface Device {
  manufacturerId: string;
  modelName: string;
  capacity: string;
}

interface TableRowData {
  manufacturerId: string;
  modelName: string;
  capacity: string;
}

const StoreOfferPriceForm: React.FC<{ storeId: number }> = ({ storeId }) => {
  const [carriers, setCarriers] = useState<CarrierDto[]>([]);
  const [tableRows, setTableRows] = useState<TableRowData[]>([]);
  const [prices, setPrices] = useState<
    Record<string, Record<string, number | "">>
  >({});

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
    try {
      const fetchPriceTableData = async () => {
        const response = await api.get<StoreOfferPriceFormData[]>(
          `/store/${storeId}/offers`,
        );
        console.log(response);
      };
      fetchPriceTableData();
    } catch (error) {
      console.error("Error fetching price table data:", error);
      toast.error("가격 정보를 불러오는 중 오류가 발생했습니다.");
    }
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await apiClient.get<Device[]>("/price-input/devices");
        console.log(response.data);
        setTableRows(response.data);
      } catch (error) {
        toast.error("기기 정보를 불러오는 데 실패했습니다.");
        console.error("Error fetching devices:", error);
      }
    };
    fetchDevices();
  }, []);

  const handleRemoveRow = (index: number) => {
    setTableRows(tableRows.filter((_, i) => i !== index));
  };

  const handlePriceChange = (
    modelName: string,
    capacity: string,
    carrier: number,
    buyingType: string,
    value: string,
  ) => {
    if (value.length > 3) return;
    const price = value === "" ? "" : Number(value);
    const key = `${modelName}-${capacity}`;
    setPrices((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [`${carrier}-${buyingType}`]: price,
      },
    }));
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

  // modelName별로 차지할 행의 개수(rowspan)를 미리 계산
  const modelRowSpans = useMemo(() => {
    const counts: Record<string, number> = {};
    tableRows.forEach(({ modelName }) => {
      counts[modelName] = (counts[modelName] || 0) + 1;
    });
    return counts;
  }, [tableRows]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceInputs: PriceInput[] = [];
    Object.entries(prices).forEach(([modelCapKey, carrierPrices]) => {
      const [model, capacity] = modelCapKey.split("-");
      Object.entries(carrierPrices).forEach(([carrierTypeKey, typePrice]) => {
        if (typePrice !== "" && typePrice !== undefined) {
          const [carrier, buyingType] = carrierTypeKey.split("-");
          priceInputs.push({
            storeId: 1, // TODO: Replace with actual store ID from auth
            model,
            capacity,
            carrier,
            buyingType: buyingType as "MNP" | "CHG",
            typePrice: Number(typePrice),
          });
        }
      });
    });

    if (priceInputs.length === 0) {
      toast.error("입력된 가격 정보가 없습니다.");
      return;
    }

    const submissionData: PriceSubmissionData = { priceInputs };

    try {
      await apiClient.post("/price-input", submissionData);
      toast.success("가격 정보가 성공적으로 등록되었습니다.");
      setPrices({}); // Reset prices after submission
    } catch (error) {
      toast.error("데이터 제출에 실패했습니다.");
      console.error(error);
    }
  };

  return (
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
              {tableRows.map(
                ({ modelName, capacity, manufacturerId }, rowIndex) => {
                  const showSeparator =
                    rowIndex > 0 &&
                    manufacturerId !== tableRows[rowIndex - 1].manufacturerId;

                  const borderClass = showSeparator
                    ? "border-t-[2px] border-[#a8a8a8] dark:border-[#737373]"
                    : rowIndex > 0
                      ? "border-t border-gray-200 dark:border-gray-600"
                      : "";

                  const isFirstInGroup =
                    rowIndex === 0 ||
                    tableRows[rowIndex - 1].modelName !== modelName;

                  return (
                    <tr key={rowIndex} className={borderClass}>
                      {/* 3. 첫 번째 행일 때만 modelName 셀을 렌더링합니다. */}
                      {isFirstInGroup && (
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white align-middle text-center border-r border-gray-200 dark:border-gray-600"
                          rowSpan={modelRowSpans[modelName]} // 계산된 rowspan 값을 적용합니다.
                        >
                          {modelName}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {capacity}
                      </td>
                      {carriers.map((carrier, carrierIndex) =>
                        offerTypes.map((type, typeIndex) => {
                          const numInputColsPerRow =
                            carriers.length * offerTypes.length;
                          const tabIndex =
                            rowIndex * numInputColsPerRow +
                            carrierIndex * offerTypes.length +
                            typeIndex +
                            1;

                          return (
                            <td
                              key={`td-${carrier.id}-${type.value}`}
                              className="px-4 py-4 whitespace-nowrap"
                            >
                              <input
                                type="number"
                                tabIndex={tabIndex}
                                className="w-full px-1 py-1 border border-gray-300 rounded-md dark:bg-background-dark dark:text-white no-spinner placeholder:text-center focus:outline-none focus:ring-2 focus:ring-primary-light"
                                value={
                                  prices[`${modelName}-${capacity}`]?.[
                                    `${carrier.id}-${type.value}`
                                  ] ?? ""
                                }
                                onChange={(e) =>
                                  handlePriceChange(
                                    modelName,
                                    capacity,
                                    carrier.id,
                                    type.value,
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                          );
                        }),
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(rowIndex)}
                          tabIndex={-1}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FaTrashAlt className="text-red-400 dark:text-red-500 hover:opacity-70" />
                        </button>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light hover:bg-primary-dark"
        >
          등록
        </button>
      </div>
    </form>
  );
};

export default StoreOfferPriceForm;
