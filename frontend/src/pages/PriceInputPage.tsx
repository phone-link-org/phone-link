import { useState } from "react";
import ExcelUpload from "../components/ExcelUpload";

const PriceInputOfferPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState< 'manual' | 'excel' >('manual');


  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-6 text-foreground-light dark:text-foreground-dark">가격 입력</h1>
      <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-lg p-0 mb-0">
        <div className="flex items-center gap-2 px-6 pt-4 pb-2">
          <button
            className={`px-5 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none border 
              ${activeTab === 'manual'
                ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark'
                : 'bg-gray-100 dark:bg-gray-700 text-foreground-light dark:text-foreground-dark border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            onClick={() => setActiveTab('manual')}
          >
             직접 입력
          </button>
          <button
            className={`px-5 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none border 
              ${activeTab === 'excel'
                ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark'
                : 'bg-gray-100 dark:bg-gray-700 text-foreground-light dark:text-foreground-dark border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            onClick={() => setActiveTab('excel')}
          >
            엑셀 파일 업로드
          </button>
        </div>
        {activeTab === 'excel' && (
          <div className="p-6">
            <ExcelUpload />
          </div>
        )}
      </div>
      </div>
  )
}

export default PriceInputOfferPage;
