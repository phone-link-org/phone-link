import React, { useEffect, useState } from "react";
import CustomCheckbox from "../CustomCheckbox";

const ModelSelector: React.FC = () => {
  const [brands, setBrands] = useState<{ brand: string }[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<string[]>([
    "128GB",
    "256GB",
    "512GB",
    "1TB",
  ]);

  const [selectedBrand, setSelectedBrands] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedStorages, setSelectedStorages] = useState<string[]>([]);

  const SERVER = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${SERVER}/api/offer/brands`)
      .then((res) => res.json())
      .then(setBrands);
  }, [SERVER]);

  useEffect(() => {
    if (selectedBrand !== null) {
      fetch(`${SERVER}/api/offer/models?brand=${selectedBrand}`)
        .then((res) => res.json())
        .then(setModels);
    }
  }, [selectedBrand, SERVER]);

  const handleModelChange = (modelName: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelName)
        ? prev.filter((m) => m !== modelName)
        : [...prev, modelName]
    );

    // if (selectedStorages[modelName]) {
    //   const { [modelName]: _, ...rest } = selectedStorages;
    //   setSelectedStorages(rest);
    // }
  };

  //   const handleStorageChange = (modelName: string, storage: StorageOption) => {
  //     setSelectedStorages((prev) => {
  //       const current = prev[modelName] || [];
  //       const isSelected = current.includes(storage);
  //       const updated = isSelected
  //         ? current.filter((s) => s !== storage)
  //         : [...current, storage];
  //       return { ...prev, [modelName]: updated };
  //     });
  //   };

  return (
    <div className="flex gap-6">
      <div className="w-1/5 max-h-60 min-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
        <div className="flex flex-col gap-2">
          {brands.map((brand) => (
            <label
              key={brand.brand}
              className="flex justify-center items-center cursor-pointer"
            >
              <CustomCheckbox
                label={brand.brand}
                checked={selectedBrand === brand.brand}
                onChange={() => setSelectedBrands(brand.brand)}
              />
            </label>
          ))}
        </div>
      </div>
      <div className="w-3/5 max-h-60 min-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {selectedBrand === null ? (
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
                key={model}
                className="flex justify-center items-center cursor-pointer"
              >
                <CustomCheckbox
                  label={model}
                  checked={selectedModels.some((item) => item === model)}
                  onChange={() => handleModelChange(model)}
                />
              </label>
            ))
          )}
        </div>
      </div>
      <div className="w-1/5 max-h-60 min-h-60 overflow-y-auto border border-gray-300 dark:border-gray-400 rounded-lg p-3 bg-white dark:bg-[#292929]">
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
                  onChange={() => {}}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
