import React, { useState } from 'react';
import ModelSelector from './offer/ModelSelector';
import type { PriceInput } from '../../../shared/types';

interface Addon {
  name: string;
  fee: number;
  requiredDuration: number;
}

const CARRIERS = {
  '1': 'SKT',
  '2': 'KT',
  '3': 'LG U+',
};

const BUYING_TYPES = {
  'MNP': '번호이동',
  'CHG': '기기변경',
};

const ManualUpload: React.FC = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, Record<string, number | ''>>>({});
  const [addons, setAddons] = useState<Addon[]>([{ name: '', fee: 0, requiredDuration: 0 }]);

  const handleModelChange = (modelName: string) => {
    setSelectedModels(prev =>
      prev.includes(modelName)
        ? prev.filter(m => m !== modelName)
        : [...prev, modelName]
    );
  };

  const handlePriceChange = (model: string, carrier: string, buyingType: string, value: string) => {
    const price = value === '' ? '' : Number(value);
    setPrices(prev => ({
      ...prev,
      [model]: {
        ...prev[model],
        [`${carrier}-${buyingType}`]: price,
      },
    }));
  };

  const handleAddonChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newAddons = [...addons];
    newAddons[index] = { ...newAddons[index], [name]: value };
    setAddons(newAddons);
  };

  const addAddon = () => {
    setAddons([...addons, { name: '', fee: 0, requiredDuration: 0 }]);
  };

  const removeAddon = (index: number) => {
    const newAddons = addons.filter((_, i) => i !== index);
    setAddons(newAddons);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceInputs: Omit<PriceInput, 'storeId' | 'location'>[] = [];
    selectedModels.forEach(model => {
      Object.keys(CARRIERS).forEach(carrier => {
        Object.keys(BUYING_TYPES).forEach(buyingType => {
          const price = prices[model]?.[`${carrier}-${buyingType}`];
          if (price !== undefined && price !== '') {
            priceInputs.push({
              devices: model,
              carrier: Number(carrier),
              buyingType: buyingType as 'MNP' | 'CHG',
              typePrice: price,
              // addons will be handled separately
            });
          }
        });
      });
    });

    console.log({ priceInputs, addons });
    // Add logic to submit data to the backend
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          모델 선택
        </label>
        <ModelSelector selectedModels={selectedModels} onModelChange={handleModelChange} />
      </div>

      {selectedModels.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  모델
                </th>
                {Object.entries(CARRIERS).map(([carrierKey, carrierName]) =>
                  Object.entries(BUYING_TYPES).map(([buyingTypeKey, buyingTypeName]) => (
                    <th key={`${carrierKey}-${buyingTypeKey}`} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {carrierName} {buyingTypeName}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {selectedModels.map(model => (
                <tr key={model}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{model}</td>
                  {Object.keys(CARRIERS).map(carrierKey =>
                    Object.keys(BUYING_TYPES).map(buyingTypeKey => (
                      <td key={`${carrierKey}-${buyingTypeKey}`} className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                          value={prices[model]?.[`${carrierKey}-${buyingTypeKey}`] ?? ''}
                          onChange={(e) => handlePriceChange(model, carrierKey, buyingTypeKey, e.target.value)}
                        />
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
            />
            <input
              type="number"
              name="fee"
              value={addon.fee}
              onChange={(e) => handleAddonChange(index, e)}
              placeholder="월 요금"
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
            />
            <input
              type="number"
              name="requiredDuration"
              value={addon.requiredDuration}
              onChange={(e) => handleAddonChange(index, e)}
              placeholder="유지 기간 (개월)"
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
            />
            <button
              type="button"
              onClick={() => removeAddon(index)}
              className="px-3 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
            >
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addAddon}
          className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + 부가서비스 추가
        </button>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
        >
          등록
        </button>
      </div>
    </form>
  );
};

export default ManualUpload;
