import React, { useState } from 'react';
import type { PriceInput, Addon, PriceSubmissionData } from '../../../shared/types';
import axios from 'axios';


const CARRIERS = {
  '1': 'SKT',
  '2': 'KT',
  '3': 'LG U+',
};

const BUYING_TYPES = {
  'MNP': '번호이동',
  'CHG': '기기변경',
};

const apiBaseURL = import.meta.env.VITE_API_URL as string;

const ManualUpload: React.FC = () => {
  const [models, setModels] = useState<{name: string, capacity: string}[]>([]);
  const [prices, setPrices] = useState<Record<string, Record<string, number | ''>>>({});
  const [addons, setAddons] = useState<Addon[]>([{ name: '', fee: 0, requiredDuration: 0 }]);

  const handleModelNameChange = (index: number, value: string) => {
    const newModels = [...models];
    newModels[index].name = value;
    setModels(newModels);
  };

  const handleModelCapacityChange = (index: number, value: string) => {
    const newModels = [...models];
    newModels[index].capacity = value;
    setModels(newModels);
  };

  const addModel = () => {
    setModels([...models, { name: '', capacity: '' }]);
  };

  const removeModel = (index: number) => {
    const modelToRemove = models[index];
    const newModels = models.filter((_, i) => i !== index);
    setModels(newModels);

    if (modelToRemove?.name) {
      setPrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[modelToRemove.name];
        return newPrices;
      });
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    const priceInputs: Omit<PriceInput, 'storeId' | 'location'>[] = [];
    models.forEach(model => {
      if (!model.name) return; // Don't submit empty model names
      Object.keys(CARRIERS).forEach(carrier => {
        Object.keys(BUYING_TYPES).forEach(buyingType => {
          const price = prices[model.name]?.[`${carrier}-${buyingType}`];
          if (price !== undefined && price !== '') {
            priceInputs.push({
                model: model.name,
                capacity: model.capacity,
                carrier: Number(carrier),
                buyingType: buyingType as 'MNP' | 'CHG',
                typePrice: price,
            });
          }
        });
      });
    });

    const submissionData: PriceSubmissionData = {
      priceInputs,
      addons,
    };

    console.log('Submitting Data:', submissionData);
    try {
      const response = await axios.post(`${apiBaseURL}/api/price-input/manual`, submissionData);
      if (response.data) {
        alert("Data submisson success");
      }
    } catch (e) {
      console.error(e)
      alert('Data submission failed !');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          모델
        </label>
        {models.map((model, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={model.name}
              onChange={(e) => handleModelNameChange(index, e.target.value)}
              placeholder="모델명 (예: Z플립5)"
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
            />
            <input
              type="text"
              value={model.capacity}
              onChange={(e) => handleModelCapacityChange(index, e.target.value)}
              placeholder="용량 (예: 256GB)"
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
            />
            <button
              type="button"
              onClick={() => removeModel(index)}
              className="px-3 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
            >
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addModel}
          className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + 모델 추가
        </button>
      </div>

      {models.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  모델
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  용량
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
              {models.map((model, index) => (
                model.name && (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{model.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{model.capacity}</td>
                  {Object.keys(CARRIERS).map(carrierKey =>
                    Object.keys(BUYING_TYPES).map(buyingTypeKey => (
                      <td key={`${carrierKey}-${buyingTypeKey}`} className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                          placeholder='단위: 만원'
                          value={prices[model.name]?.[`${carrierKey}-${buyingTypeKey}`] ?? ''}
                          onChange={(e) => handlePriceChange(model.name, carrierKey, buyingTypeKey, e.target.value)}
                        />
                      </td>
                    ))
                  )}
                </tr>
                )
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
