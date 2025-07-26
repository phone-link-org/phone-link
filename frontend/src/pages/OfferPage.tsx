import React, { useState } from 'react';

const regions = [
  { value: 'seoul', label: '서울' },
  { value: 'busan', label: '부산' },
  { value: 'incheon', label: '인천' },
  { value: 'daegu', label: '대구' },
  { value: 'gwangju', label: '광주' },
  { value: 'daejeon', label: '대전' },
  { value: 'ulsan', label: '울산' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'gangwon', label: '강원' },
  { value: 'chungbuk', label: '충북' },
  { value: 'chungnam', label: '충남' },
  { value: 'jeonbuk', label: '전북' },
  { value: 'jeonnam', label: '전남' },
  { value: 'gyeongbuk', label: '경북' },
  { value: 'gyeongnam', label: '경남' },
  { value: 'jeju', label: '제주' },
];

const subRegions: Record<string, { value: string; label: string }[]> = {
  seoul: [
    { value: 'all', label: '전체' },
    { value: 'gangbuk', label: '강북구' },
    { value: 'gangdong', label: '강동구' },
    { value: 'gangnam', label: '강남구' },
    { value: 'gwanak', label: '관악구' },
    { value: 'gwangjin', label: '광진구' },
    { value: 'guro', label: '구로구' },
    { value: 'geumcheon', label: '금천구' },
    { value: 'nowon', label: '노원구' },
    { value: 'dobong', label: '도봉구' },
    { value: 'dongdaemun', label: '동대문구' },
    { value: 'dongjak', label: '동작구' },
    { value: 'mapo', label: '마포구' },
    { value: 'seodaemun', label: '서대문구' },
    { value: 'seocho', label: '서초구' },
    { value: 'seongbuk', label: '성북구' },
    { value: 'seongdong', label: '성동구' },
    { value: 'songpa', label: '송파구' },
    { value: 'yangcheon', label: '양천구' },
    { value: 'yeongdeungpo', label: '영등포구' },
    { value: 'eunpyeong', label: '은평구' },
    { value: 'jongno', label: '종로구' },
    { value: 'junggu', label: '중구' },
    { value: 'jungnang', label: '중랑구' },
  ],
  busan: [
    { value: 'all', label: '전체' },
    { value: 'bukgu', label: '북구' },
    { value: 'busanjin', label: '부산진구' },
    { value: 'donggu', label: '동구' },
    { value: 'dongnae', label: '동래구' },
    { value: 'gijang', label: '기장군' },
    { value: 'geumjeong', label: '금정구' },
    { value: 'namgu', label: '남구' },
    { value: 'saha', label: '사하구' },
    { value: 'sasang', label: '사상구' },
    { value: 'seo-gu', label: '서구' },
    { value: 'suyeong', label: '수영구' },
    { value: 'yeonje', label: '연제구' },
    { value: 'haeundae', label: '해운대구' },
    { value: 'gangseo', label: '강서구' },
    { value: 'junggu', label: '중구' },
  ],
  // 나머지는 빈 배열
  incheon: [], daegu: [], gwangju: [], daejeon: [], ulsan: [], gyeonggi: [], gangwon: [], chungbuk: [], chungnam: [], jeonbuk: [], jeonnam: [], gyeongbuk: [], gyeongnam: [], jeju: [],
};

const OfferPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'region' | 'model'>('region');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSubRegions, setSelectedSubRegions] = useState<Record<string, string[]>>({});
  const [selectedModel, setSelectedModel] = useState('all');

  // 시/도 체크박스 핸들러 (하나만 선택)
  const handleRegionChange = (regionValue: string) => {
    setSelectedRegions(prev => {
      if (prev[0] === regionValue) {
        // 이미 선택된 시/도를 다시 누르면 해제
        setSelectedSubRegions(subPrev => {
          const newSub = { ...subPrev };
          delete newSub[regionValue];
          return newSub;
        });
        return [];
      } else {
        // 다른 시/도를 누르면 기존 선택 해제, 새 시/도만 선택
        setSelectedSubRegions(subPrev => {
          const newSub: Record<string, string[]> = {};
          // 기존에 선택된 구/군이 있으면 해당 시/도만 남김
          if (subPrev[regionValue]) newSub[regionValue] = subPrev[regionValue];
          return newSub;
        });
        return [regionValue];
      }
    });
  };

  // 구/군 체크박스 핸들러
  const handleSubRegionChange = (regionValue: string, subValue: string) => {
    setSelectedSubRegions(prev => {
      const current = prev[regionValue] || [];
      if (current.includes(subValue)) {
        return { ...prev, [regionValue]: current.filter(v => v !== subValue) };
      } else {
        return { ...prev, [regionValue]: [...current, subValue] };
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-6 text-foreground-light dark:text-foreground-dark">가격 비교</h1>
      {/* 검색 조건 탭 - pill 형태, 좌측정렬 */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-lg p-0 mb-0">
        <div className="flex items-center gap-2 px-6 pt-4 pb-2">
          <button
            className={`px-5 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none border 
              ${activeTab === 'region' 
                ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark' 
                : 'bg-gray-100 dark:bg-gray-700 text-foreground-light dark:text-foreground-dark border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            onClick={() => setActiveTab('region')}
          >
            지역
          </button>
          <button
            className={`px-5 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none border 
              ${activeTab === 'model' 
                ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark' 
                : 'bg-gray-100 dark:bg-gray-700 text-foreground-light dark:text-foreground-dark border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            onClick={() => setActiveTab('model')}
          >
            모델
          </button>
        </div>
      </div>
      {/* 검색 조건 입력 영역 (탭별로 다르게) */}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground-light dark:text-foreground-dark">검색 조건</h2>
        <div className="grid grid-cols-1 gap-6">
          {/* 탭별 조건 */}
          {activeTab === 'region' ? (
            <div className="flex gap-6">
              {/* 시/도 체크박스 */}
              <div className="w-1/4 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {regions.map(region => (
                    <label key={region.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRegions.includes(region.value)}
                        onChange={() => handleRegionChange(region.value)}
                        className="w-4 h-4 text-primary-light dark:text-primary-dark bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-primary-light dark:focus:ring-primary-dark"
                      />
                      <span className="text-sm text-foreground-light dark:text-foreground-dark">{region.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* 구/군 체크박스 (선택된 시/도만) */}
              <div className="w-3/4 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                {selectedRegions.length === 0 ? (
                  <div className="text-gray-400 text-sm">시/도를 먼저 선택하세요.</div>
                ) : (
                  selectedRegions.map(regionValue => (
                    <div key={regionValue} className="mb-4">
                      {/* <div className="font-semibold text-primary-light dark:text-primary-dark mb-2">
                        {regions.find(r => r.value === regionValue)?.label}
                      </div> */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {subRegions[regionValue].length === 0 ? (
                          <span className="text-gray-400 text-xs">구/군 데이터 없음</span>
                        ) : (
                          subRegions[regionValue].map(sub => (
                            <label key={sub.value} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedSubRegions[regionValue]?.includes(sub.value) || false}
                                onChange={() => handleSubRegionChange(regionValue, sub.value)}
                                className="w-4 h-4 text-primary-light dark:text-primary-dark bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-primary-light dark:focus:ring-primary-dark"
                              />
                              <span className="text-xs text-foreground-light dark:text-foreground-dark">{sub.label}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground-light dark:text-foreground-dark">
                모델 선택
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-foreground-light dark:text-foreground-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="galaxy-s24">갤럭시 S24</option>
                <option value="iphone-15">아이폰 15</option>
                <option value="galaxy-z-flip5">갤럭시 Z 플립5</option>
                <option value="iphone-14">아이폰 14</option>
                <option value="galaxy-s23">갤럭시 S23</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferPage; 