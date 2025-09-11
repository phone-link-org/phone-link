import React, { useState, useEffect } from "react";
import { api } from "../../api/axios";
import DataGrid, { type ColumnDef } from "./DataGrid";
import { toast } from "sonner";
import type {
  PhoneDetailFormData,
  PhoneModelGridData,
  PhoneStorageDto,
} from "../../../../shared/types";
import PhoneModelDetailModal from "./PhoneModelDetailModal";

const MasterDataManager: React.FC = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<string>("phone-models");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneModelDatas, setPhoneModelDatas] = useState<PhoneModelGridData[]>(
    [],
  );
  const [selectedPhoneModel, setSelectedPhoneModel] =
    useState<PhoneDetailFormData | null>(null);
  const [phoneStorageDatas, setPhoneStorageDatas] = useState<PhoneStorageDto[]>(
    [],
  );

  const masterDataMenus = [
    { id: "phone-models", name: "핸드폰 모델" },
    { id: "phone-storages", name: "핸드폰 용량" },
    { id: "phone-manufacturers", name: "핸드폰 제조사" },
    { id: "carriers", name: "통신사 정보" },
  ];

  const phoneModelColumns: ColumnDef<PhoneModelGridData>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name_ko", header: "모델명" },
    { accessorKey: "imageUrl", header: "이미지 URL" },
  ];

  const phoneStorageColumns: ColumnDef<PhoneStorageDto>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "storage", header: "용량" },
  ];

  const fetchPhoneModels = async () => {
    try {
      const result = await api.get<PhoneModelGridData[]>("/admin/phone-models");
      setPhoneModelDatas(result);
    } catch (err) {
      console.error(err);
      toast.error("핸드폰 모델 데이터를 불러오는데 실패했습니다.");
    }
  };

  const fetchPhoneStorages = async () => {
    try {
      const result = await api.get<PhoneStorageDto[]>("/admin/phone-storages");
      setPhoneStorageDatas(result);
    } catch (err) {
      console.error(err);
      toast.error("핸드폰 모델 데이터를 불러오는데 실패했습니다.");
    }
  };

  useEffect(() => {
    switch (activeSubMenu) {
      case "phone-models":
        fetchPhoneModels();
        break;
      case "phone-storages":
        fetchPhoneStorages();
        break;
      case "phone-manufacturers":
        break;
      case "carriers":
        break;
      default:
        break;
    }
  }, [activeSubMenu]);

  const handleGridRowClick = async (menuId: string, itemId: number) => {
    if (menuId === "phone-models") {
      try {
        // 상세 데이터 요청 API
        const response = await api.get<PhoneDetailFormData>(
          `/admin/phone-detail/${itemId}`,
        );
        setSelectedPhoneModel(response);
        setIsModalOpen(true);
      } catch (error) {
        toast.error("모델 상세 정보를 불러오는 데 실패했습니다.");
        console.error(error);
      }
    }
  };

  const handleDataAdd = (menuId: string) => {
    if (menuId === "phone-models") {
      setSelectedPhoneModel({
        modelId: null,
        manufacturerId: 0,
        manufacturerName: "",
        modelName_ko: "",
        modelName_en: "",
        imageUrl: "",
        releaseDate: new Date(),
        storages: [],
      });
      setIsModalOpen(true);
    } else {
      toast.success(`Current menu: ${menuId}`);
    }
  };

  return (
    <div>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        시스템에 사용되는 정보를 관리합니다.
      </p>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <nav className="flex flex-col space-y-2">
            {masterDataMenus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => setActiveSubMenu(menu.id)}
                className={`px-4 py-2 text-left rounded-lg transition-colors duration-200 ${
                  activeSubMenu === menu.id
                    ? "bg-primary-light text-white dark:bg-primary-dark dark:text-black"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {menu.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Content */}
        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="bg-gray-50 dark:bg-background-dark p-6 rounded-lg shadow-inner min-h-[400px]">
            {activeSubMenu === "carriers" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-foreground-light dark:text-foreground-dark">
                  통신사 정보 관리
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  통신사 데이터를 표시하고 관리하는 UI가 여기에 표시됩니다.
                </p>
              </div>
            )}
            {activeSubMenu === "phone-manufacturers" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-foreground-light dark:text-foreground-dark">
                  핸드폰 제조사 관리
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  핸드폰 제조사 데이터를 표시하고 관리하는 UI가 여기에
                  표시됩니다.
                </p>
              </div>
            )}
            {activeSubMenu === "phone-models" && (
              <DataGrid
                title="핸드폰 모델 관리"
                columns={phoneModelColumns}
                data={phoneModelDatas}
                onRowClick={(rowId) =>
                  handleGridRowClick("phone-models", rowId)
                }
                onAddItem={() => handleDataAdd("phone-models")}
              />
            )}
            {activeSubMenu === "phone-storages" && (
              <DataGrid
                title="핸드폰 용량 관리"
                columns={phoneStorageColumns}
                data={phoneStorageDatas}
                onRowClick={(rowId) =>
                  handleGridRowClick("phone-storages", rowId)
                }
                onAddItem={() => handleDataAdd("phone-storages")}
              />
            )}
          </div>
        </main>
      </div>

      {activeSubMenu === "phone-models" && isModalOpen && (
        <PhoneModelDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          phoneModelData={selectedPhoneModel}
        />
      )}
    </div>
  );
};

export default MasterDataManager;
