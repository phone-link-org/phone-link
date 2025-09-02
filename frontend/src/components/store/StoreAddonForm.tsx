import { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";
import { FaTrashAlt, FaChevronDown } from "react-icons/fa";
import type { AddonFormData, CarrierDto } from "../../../../shared/types";
import { api } from "../../api/axios";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useTheme } from "../../hooks/useTheme";

const StoreAddonForm: React.FC<{ storeId: number }> = ({ storeId }) => {
  const [carriers, setCarriers] = useState<CarrierDto[]>([]);
  const [addons, setAddons] = useState<AddonFormData[]>([
    {
      name: "",
      carrierId: 1,
      monthlyFee: 0,
      durationMonths: 0,
      penaltyFee: 0,
    },
  ]);

  const { theme } = useTheme();

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

  useEffect(() => {
    try {
      const fetchAddons = async () => {
        const response = await api.get<AddonFormData[]>(
          `/store/${storeId}/addons`,
        );
        setAddons(
          response.length > 0
            ? response
            : [
                {
                  name: "",
                  carrierId: 1,
                  monthlyFee: 0,
                  durationMonths: 0,
                  penaltyFee: 0,
                },
              ],
        );
      };
      fetchAddons();
    } catch (error) {
      console.error("Error fetching addons:", error);
      toast.error("부가서비스 데이터을 불러오는 중 오류가 발생했습니다.");
    }
  }, []);

  const handleAddonChange = (
    index: number,
    field: keyof AddonFormData,
    value: string | number | null,
  ) => {
    // 숫자 필드 길이 제한
    if (
      ["monthlyFee", "durationMonths", "penaltyFee"].includes(field) &&
      typeof value === "string" &&
      value.length > 6
    ) {
      return;
    }

    const newAddons = [...addons];
    const processedValue =
      ["monthlyFee", "durationMonths", "penaltyFee"].includes(field) && value
        ? Number(value)
        : value;

    newAddons[index] = { ...newAddons[index], [field]: processedValue };
    setAddons(newAddons);
  };

  const addAddon = () => {
    setAddons([
      ...addons,
      {
        name: "",
        carrierId: 1,
        monthlyFee: 0,
        durationMonths: 0,
        penaltyFee: 0,
      },
    ]);
  };

  const removeAddon = (index: number) => {
    if (addons.length > 1) {
      setAddons(addons.filter((_, i) => i !== index));
    }
  };

  const handleAddonSave = () => {
    const hasInvalidAddon = addons.some(
      (addon) =>
        addon.name.trim() === "" || // 이름이 비어있거나 공백만 있는지 확인
        addon.monthlyFee === 0 || // 월 요금이 0인지 확인
        addon.durationMonths === 0 || // 약정 기간이 0인지 확인
        addon.penaltyFee === 0, // 위약금이 0인지 확인
    );

    Swal.fire({
      title: hasInvalidAddon
        ? "입력값이 존재하지 않는 부가서비스가 존재합니다."
        : "저장하시겠습니까?",
      html: hasInvalidAddon ? "그래도 저장하시겠습니까?" : undefined,
      icon: hasInvalidAddon ? "warning" : "question",
      showCancelButton: true,
      background: theme === "dark" ? "#343434" : "#fff",
      color: theme === "dark" ? "#e5e7eb" : "#1f2937",
      confirmButtonColor: theme === "dark" ? "#9DC183" : "#4F7942",
      cancelButtonColor: theme === "dark" ? "#F97171" : "#EF4444",
      confirmButtonText: "저장",
      cancelButtonText: "취소",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post(`/store/${storeId}/addon-save`, {
            addons,
          });
          toast.success("저장되었습니다.");
        } catch (error) {
          console.error("Error saving addons:", error);
          toast.error("부가서비스를 저장하는 중 오류가 발생했습니다.");
        }
      }
    });
  };

  return (
    <div className="p-6 rounded-b-lg">
      {/* 헤더 */}
      <div className="flex gap-3 px-2 text-center">
        <div className="w-32">
          <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
            통신사
          </label>
        </div>
        <div className="w-1/2">
          <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
            부가서비스명
          </label>
        </div>
        <div className="w-32">
          <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
            월 요금 (원)
          </label>
        </div>
        <div className="w-28">
          <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
            기간 (개월)
          </label>
        </div>
        <div className="w-32">
          <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
            추가 요금 (만원)
          </label>
        </div>
        <div className="w-8">{/* 삭제 버튼 공간 */}</div>
      </div>

      {addons.map((addon, index) => (
        <div key={index} className="p-2">
          <div className="flex items-end gap-3">
            {/* 통신사 선택 */}
            <div className="w-32">
              <Combobox
                value={
                  carriers.find((carrier) => carrier.id === addon.carrierId) ||
                  null
                }
                onChange={(carrier) =>
                  handleAddonChange(index, "carrierId", carrier?.id || null)
                }
              >
                <div className="relative">
                  <Combobox.Input
                    className="w-full px-2 py-2 border border-gray-300 rounded-md dark:bg-background-dark dark:text-white no-spinner focus:outline-none focus:ring-2 focus:ring-primary-light"
                    displayValue={(carrier: CarrierDto | null) =>
                      carrier?.name || "통신사 선택"
                    }
                    readOnly
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <FaChevronDown
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-background-dark py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {carriers.map((carrier) => (
                      <Combobox.Option
                        key={carrier.id}
                        value={carrier}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-3 pr-9 ${
                            active
                              ? "bg-blue-600 text-white"
                              : "text-gray-900 dark:text-gray-100"
                          }`
                        }
                      >
                        {carrier.name}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>

            {/* 부가서비스명 */}
            <div className="w-1/2">
              <input
                type="text"
                value={addon.name}
                onChange={(e) =>
                  handleAddonChange(index, "name", e.target.value)
                }
                className="w-full px-2 py-2 border border-gray-300 rounded-md dark:bg-background-dark dark:text-white no-spinner focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>

            {/* 월 납부 요금 */}
            <div className="w-32">
              <input
                type="number"
                value={addon.monthlyFee || ""}
                onChange={(e) =>
                  handleAddonChange(index, "monthlyFee", e.target.value)
                }
                min="0"
                className="w-full px-2 py-2 border border-gray-300 rounded-md dark:bg-background-dark dark:text-white no-spinner focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>

            {/* 유지 기간 */}
            <div className="w-28">
              <input
                type="number"
                value={addon.durationMonths || ""}
                onChange={(e) =>
                  handleAddonChange(index, "durationMonths", e.target.value)
                }
                min="0"
                className="w-full px-2 py-2 border border-gray-300 rounded-md dark:bg-background-dark dark:text-white no-spinner focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>

            {/* 미가입시 추가 요금 */}
            <div className="w-32">
              <input
                type="number"
                value={addon.penaltyFee || ""}
                onChange={(e) =>
                  handleAddonChange(index, "penaltyFee", e.target.value)
                }
                min="0"
                className="w-full px-2 py-2 border border-gray-300 rounded-md dark:bg-background-dark dark:text-white no-spinner focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>

            {/* 삭제 버튼 */}

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeAddon(index)}
                className="flex items-center justify-center w-8 h-10 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="삭제"
              >
                <FaTrashAlt className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* 부가서비스 추가 버튼 */}
      <div className="flex justify-center px-2 py-4">
        <button
          type="button"
          onClick={addAddon}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-md font-medium transition-colors"
        >
          + 부가서비스 추가
        </button>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-center mt-2">
        <button
          type="button"
          onClick={() => {
            handleAddonSave();
          }}
          className="px-4 py-2 w-full rounded bg-primary-light hover:bg-[#3d5e33] dark:bg-primary-dark dark:hover:bg-[#759161] text-white dark:text-foreground-light text-base font-medium transition-colors"
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default StoreAddonForm;
