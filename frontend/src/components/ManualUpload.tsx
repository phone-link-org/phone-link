import React, { useState, useEffect } from "react";
import type {
  PriceInput,
  Addon,
  PriceSubmissionData,
} from "../../../shared/types";
import apiClient from "../api/axios";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "sonner";

const CARRIERS = {
  "1": "SKT",
  "2": "KT",
  "3": "LG U+",
};

const BUYING_TYPES = {
  MNP: "번호이동",
  CHG: "기기변경",
};

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

const ManualUpload: React.FC = () => {
  const [tableRows, setTableRows] = useState<TableRowData[]>([]);
  const [prices, setPrices] = useState<
    Record<string, Record<string, number | "">>
  >({});
  const [addons, setAddons] = useState<Addon[]>([
    {
      name: "",
      carrier: "1",
      monthlyFee: 0,
      requiredDuration: 0,
      penaltyFee: 0,
    },
  ]);

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
    carrier: string,
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

  const handleAddonChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (
      ["monthlyFee", "requiredDuration", "penaltyFee"].includes(name) &&
      value.length > 3
    ) {
      return;
    }
    const newAddons = [...addons];
    const numValue =
      ["monthlyFee", "requiredDuration", "penaltyFee"].includes(name) && value
        ? parseInt(value)
        : value;
    newAddons[index] = { ...newAddons[index], [name]: numValue };
    setAddons(newAddons);
  };

  const addAddon = () => {
    setAddons([
      ...addons,
      {
        name: "",
        carrier: "1",
        monthlyFee: 0,
        requiredDuration: 0,
        penaltyFee: 0,
      },
    ]);
  };

  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

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

    const submissionData: PriceSubmissionData = { priceInputs, addons };

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
        <table className="min-w-full table-fixed">
          <thead className="bg-primary-light dark:bg-primary-dark">
            <tr>
              <th
                scope="col"
                className="w-48 px-6 py-3 text-center text-sm font-medium text-white dark:text-black uppercase tracking-wider"
              >
                모델
              </th>
              <th
                scope="col"
                className="w-24 px-6 py-3 text-center text-sm font-medium text-white dark:text-black uppercase tracking-wider"
              >
                용량
              </th>
              {Object.values(CARRIERS).map((carrierName) =>
                Object.values(BUYING_TYPES).map((buyingTypeName) => (
                  <th
                    key={`${carrierName}-${buyingTypeName}`}
                    scope="col"
                    className="w-32 px-6 py-3 text-center text-sm font-medium text-white dark:text-black uppercase tracking-wider"
                  >
                    {carrierName}
                    <br />
                    {buyingTypeName}
                  </th>
                )),
              )}
              <th
                scope="col"
                className="w-20 px-6 py-3 text-center text-sm font-medium text-white dark:text-black uppercase tracking-wider"
              >
                삭제
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#292929]">
            {tableRows.map(
              ({ modelName, capacity, manufacturerId }, rowIndex) => {
                const showSeparator =
                  rowIndex > 0 &&
                  manufacturerId !== tableRows[rowIndex - 1].manufacturerId;

                const borderClass = showSeparator
                  ? "border-t-[2px] border-black dark:border-white"
                  : rowIndex > 0
                    ? "border-t border-gray-200 dark:border-gray-600"
                    : "";

                return (
                  <tr key={rowIndex} className={borderClass}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {modelName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {capacity}
                    </td>
                    {Object.keys(CARRIERS).map((carrierKey, carrierIndex) =>
                      Object.keys(BUYING_TYPES).map(
                        (buyingTypeKey, buyingTypeIndex) => {
                          const numInputColsPerRow =
                            Object.keys(CARRIERS).length *
                            Object.keys(BUYING_TYPES).length;
                          const tabIndex =
                            rowIndex * numInputColsPerRow +
                            carrierIndex * Object.keys(BUYING_TYPES).length +
                            buyingTypeIndex +
                            1;

                          return (
                            <td
                              key={`${carrierKey}-${buyingTypeKey}`}
                              className="px-4 py-4 whitespace-nowrap"
                            >
                              <input
                                type="number"
                                tabIndex={tabIndex}
                                className="w-full px-1 py-1 border border-gray-300 rounded-md dark:bg-background-dark dark:text-white no-spinner placeholder:text-center focus:outline-none focus:ring-2 focus:ring-primary-light"
                                placeholder="단위: 만원"
                                value={
                                  prices[`${modelName}-${capacity}`]?.[
                                    `${carrierKey}-${buyingTypeKey}`
                                  ] ?? ""
                                }
                                onChange={(e) =>
                                  handlePriceChange(
                                    modelName,
                                    capacity,
                                    carrierKey,
                                    buyingTypeKey,
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                          );
                        },
                      ),
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          부가서비스
        </label>
        {addons.map((addon, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <input
              type="text"
              name="name"
              value={addon.name}
              onChange={(e) => handleAddonChange(index, e)}
              placeholder="부가서비스명"
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
            />
            <select
              name="carrier"
              value={addon.carrier}
              onChange={(e) => handleAddonChange(index, e)}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
            >
              {Object.entries(CARRIERS).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="monthlyFee"
              value={addon.monthlyFee}
              onChange={(e) => handleAddonChange(index, e)}
              placeholder="월 요금"
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm no-spinner"
            />
            <input
              type="number"
              name="requiredDuration"
              value={addon.requiredDuration}
              onChange={(e) => handleAddonChange(index, e)}
              placeholder="유지 기간 (개월)"
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm no-spinner"
            />
            <input
              type="number"
              name="penaltyFee"
              value={addon.penaltyFee}
              onChange={(e) => handleAddonChange(index, e)}
              placeholder="미가입시 발생 요금(만원)"
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm no-spinner"
            />
            <button
              type="button"
              onClick={() => removeAddon(index)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <FaTrashAlt className="text-red-400 dark:text-red-500 hover:opacity-70" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addAddon}
          className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          + 부가서비스 추가
        </button>
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

export default ManualUpload;
