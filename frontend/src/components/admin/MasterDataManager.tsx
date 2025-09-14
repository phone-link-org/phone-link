import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../api/axios";
import DataGrid, { type ColumnDef } from "./DataGrid";
import { toast } from "sonner";
import type {
  CarrierDto,
  PhoneDetailFormData,
  PhoneManufacturerDto,
  PhoneModelGridData,
  PhoneStorageDto,
} from "../../../../shared/types";
import ModelModal from "./ModelModal";
import StorageModal from "./StorageModal";
import ManufacturerModal from "./ManufacturerModal";
import CarrierModal from "./CarrierModal";

const MasterDataManager: React.FC = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<string>("models");

  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isManufacturerModalOpen, setIsManufacturerModalOpen] = useState(false);
  const [isCarrierModalOpen, setIsCarrierModalOpen] = useState(false);

  const [phoneModelDatas, setPhoneModelDatas] = useState<PhoneModelGridData[]>(
    [],
  );
  const [selectedPhoneModel, setSelectedPhoneModel] =
    useState<PhoneDetailFormData | null>(null);

  const [phoneStorageDatas, setPhoneStorageDatas] = useState<PhoneStorageDto[]>(
    [],
  );
  const [selectedStorage, setSelectedStorage] =
    useState<PhoneStorageDto | null>(null);

  const [manufacturerDatas, setManufacturerDatas] = useState<
    PhoneManufacturerDto[]
  >([]);
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<PhoneManufacturerDto | null>(null);

  const [carrierDatas, setCarrierDatas] = useState<CarrierDto[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierDto | null>(
    null,
  );

  const masterDataMenus = [
    { id: "models", name: "핸드폰 모델" },
    { id: "storages", name: "핸드폰 용량" },
    { id: "manufacturers", name: "핸드폰 제조사" },
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

  const manufacturerColumns: ColumnDef<PhoneManufacturerDto>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name_ko", header: "제조사명(한)" },
    { accessorKey: "name_en", header: "제조사명(영)" },
  ];

  const carrierColumns: ColumnDef<CarrierDto>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "통신사명" },
    { accessorKey: "imageUrl", header: "로고 URL" },
  ];

  const fetchData = useCallback(async () => {
    try {
      let result;
      switch (activeSubMenu) {
        case "models":
          result = await api.get<PhoneModelGridData[]>("/admin/phone-models");
          setPhoneModelDatas(result);
          break;
        case "storages":
          result = await api.get<PhoneStorageDto[]>("/admin/storages");
          setPhoneStorageDatas(result);
          break;
        case "manufacturers":
          result = await api.get<PhoneManufacturerDto[]>(
            "/admin/manufacturers",
          );
          setManufacturerDatas(result);
          break;
        case "carriers":
          result = await api.get<CarrierDto[]>("/admin/carriers");
          setCarrierDatas(result);
          break;
        default:
          toast.error("비정상적인 접근입니다.");
          break;
      }
    } catch (err) {
      console.error(err);
      toast.error(`${activeSubMenu} 데이터를 불러오는데 실패했습니다.`);
    }
  }, [activeSubMenu]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGridRowClick = async (menuId: string, itemId: number) => {
    try {
      let response;
      switch (menuId) {
        case "models":
          response = await api.get<PhoneDetailFormData>(
            `/admin/phone-detail/${itemId}`,
          );
          setSelectedPhoneModel(response);
          setIsModelModalOpen(true);
          break;
        case "storages":
          response = await api.get<PhoneStorageDto>(`/admin/storage/${itemId}`);
          setSelectedStorage(response);
          setIsStorageModalOpen(true);
          break;
        case "manufacturers":
          response = await api.get<PhoneManufacturerDto>(
            `/admin/manufacturer/${itemId}`,
          );
          setSelectedManufacturer(response);
          setIsManufacturerModalOpen(true);
          break;
        case "carriers":
          response = await api.get<CarrierDto>(`/admin/carrier/${itemId}`);
          setSelectedCarrier(response);
          setIsCarrierModalOpen(true);
          break;
      }
    } catch (error) {
      toast.error("상세 정보를 불러오는 데 실패했습니다.");
      console.error(error);
    }
  };

  const handleDataAdd = (menuId: string) => {
    switch (menuId) {
      case "models":
        setSelectedPhoneModel(null);
        setIsModelModalOpen(true);
        break;
      case "storages":
        setSelectedStorage(null);
        setIsStorageModalOpen(true);
        break;
      case "manufacturers":
        setSelectedManufacturer(null);
        setIsManufacturerModalOpen(true);
        break;
      case "carriers":
        setSelectedCarrier(null);
        setIsCarrierModalOpen(true);
        break;
    }
  };

  const renderContent = () => {
    switch (activeSubMenu) {
      case "models":
        return (
          <DataGrid
            title="핸드폰 모델 관리"
            columns={phoneModelColumns}
            data={phoneModelDatas}
            onRowClick={(rowId) => handleGridRowClick("models", rowId)}
            onAddItem={() => handleDataAdd("models")}
          />
        );
      case "storages":
        return (
          <DataGrid
            title="핸드폰 용량 관리"
            columns={phoneStorageColumns}
            data={phoneStorageDatas}
            onRowClick={(rowId) => handleGridRowClick("storages", rowId)}
            onAddItem={() => handleDataAdd("storages")}
          />
        );
      case "manufacturers":
        return (
          <DataGrid
            title="핸드폰 제조사 관리"
            columns={manufacturerColumns}
            data={manufacturerDatas}
            onRowClick={(rowId) => handleGridRowClick("manufacturers", rowId)}
            onAddItem={() => handleDataAdd("manufacturers")}
          />
        );
      case "carriers":
        return (
          <DataGrid
            title="통신사 정보 관리"
            columns={carrierColumns}
            data={carrierDatas}
            onRowClick={(rowId) => handleGridRowClick("carriers", rowId)}
            onAddItem={() => handleDataAdd("carriers")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        시스템에 사용되는 정보를 관리합니다.
      </p>
      <div className="flex flex-col md:flex-row gap-8">
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

        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="bg-gray-50 dark:bg-background-dark p-6 rounded-lg shadow-inner min-h-[400px]">
            {renderContent()}
          </div>
        </main>
      </div>

      {isModelModalOpen && (
        <ModelModal
          isOpen={isModelModalOpen}
          onClose={() => setIsModelModalOpen(false)}
          phoneModelData={selectedPhoneModel}
          onSave={fetchData}
        />
      )}

      {isStorageModalOpen && (
        <StorageModal
          isOpen={isStorageModalOpen}
          onClose={() => setIsStorageModalOpen(false)}
          storageData={selectedStorage}
          onSave={fetchData}
        />
      )}

      {isManufacturerModalOpen && (
        <ManufacturerModal
          isOpen={isManufacturerModalOpen}
          onClose={() => setIsManufacturerModalOpen(false)}
          manufacturerData={selectedManufacturer}
          onSave={fetchData}
        />
      )}

      {isCarrierModalOpen && (
        <CarrierModal
          isOpen={isCarrierModalOpen}
          onClose={() => setIsCarrierModalOpen(false)}
          carrierData={selectedCarrier}
          onSave={fetchData}
        />
      )}
    </div>
  );
};

export default MasterDataManager;
