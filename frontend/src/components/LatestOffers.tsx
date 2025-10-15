import React, { useState, useEffect } from "react";
import { api } from "../api/axios";
import { logger } from "../utils/Logger";

interface Offer {
  id: number;
  storeId: number;
  storeName: string;
  regionName: string;
  carrierName: string;
  modelName: string;
  offerType: string;
  price: number;
  imageUrl: string;
  manufacturerId: number;
  latestTime: string;
}

const LatestOffers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestOffers();
  }, []);

  const fetchLatestOffers = async () => {
    try {
      setLoading(true);
      setError(null);

      // API 호출 시작 로깅
      await logger.info("Fetching latest offers from API", {
        component: "LatestOffers",
        action: "fetchLatestOffers",
      });

      const response = await api.get<Offer[]>("/offer/latest");

      setOffers(response);

      // 성공 로깅
      await logger.info("Successfully fetched latest offers", {
        component: "LatestOffers",
        action: "fetchLatestOffers",
        resultCount: response.length,
        offers: response.map((offer) => ({
          id: offer.id,
          modelName: offer.modelName,
          price: offer.price,
        })),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);

      // 에러 로깅
      await logger.error("Failed to fetch latest offers", error instanceof Error ? error : new Error(errorMessage), {
        component: "LatestOffers",
        action: "fetchLatestOffers",
        errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOfferClick = async (offer: Offer) => {
    try {
      // 사용자 액션 로깅
      await logger.info("User clicked on offer", {
        component: "LatestOffers",
        action: "handleOfferClick",
        offerId: offer.id,
        modelName: offer.modelName,
        price: offer.price,
        storeName: offer.storeName,
      });

      // 여기서 상세 페이지로 이동하거나 모달을 열 수 있습니다
      console.log("Offer clicked:", offer);
    } catch (error) {
      await logger.error("Error handling offer click", error instanceof Error ? error : new Error("Unknown error"), {
        component: "LatestOffers",
        action: "handleOfferClick",
        offerId: offer.id,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8">
        <div className="text-red-500 text-lg mb-4">오류가 발생했습니다: {error}</div>
        <button onClick={fetchLatestOffers} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">최신 등록 조건</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleOfferClick(offer)}
          >
            {offer.imageUrl && (
              <img
                src={offer.imageUrl}
                alt={offer.modelName}
                className="w-full h-32 object-contain mb-3"
                onError={async (e) => {
                  await logger.warn("Failed to load offer image", {
                    component: "LatestOffers",
                    offerId: offer.id,
                    imageUrl: offer.imageUrl,
                  });
                }}
              />
            )}

            <h3 className="font-semibold text-lg mb-2">{offer.modelName}</h3>
            <p className="text-gray-600 mb-1">{offer.storeName}</p>
            <p className="text-gray-600 mb-1">{offer.regionName}</p>
            <p className="text-gray-600 mb-2">{offer.carrierName}</p>
            <p className="text-blue-600 font-bold text-xl">{offer.price.toLocaleString()}원</p>
            <p className="text-sm text-gray-500 mt-2">
              {offer.offerType} • {new Date(offer.latestTime).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestOffers;
