import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiStar, FiMapPin, FiChevronRight } from "react-icons/fi";
import { toast } from "sonner";
import { api } from "../../api/axios";
import Modal from "./Modal";

// 즐겨찾기 매장 타입 정의
interface FavoriteStore {
  id: number;
  thumbnail_url: string | null;
  name: string;
  address: string;
  address_detail: string | null;
}

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [favoriteStores, setFavoriteStores] = useState<FavoriteStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 즐겨찾기 매장 목록 조회
  const fetchFavoriteStores = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<FavoriteStore[]>("/user/favorites");
      setFavoriteStores(response);
    } catch (error) {
      console.error("즐겨찾기 매장 조회 중 오류:", error);
      toast.error("즐겨찾기 매장을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 열릴 때 데이터 조회
  useEffect(() => {
    if (isOpen) {
      fetchFavoriteStores();
    }
  }, [isOpen]);

  // 매장 클릭 핸들러
  const handleStoreClick = (storeId: number) => {
    navigate(`/store/${storeId}`);
    onClose();
  };

  // 주소 조합 함수
  const getFullAddress = (address: string, addressDetail: string | null) => {
    return addressDetail ? `${address} ${addressDetail}` : address;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="관심 매장" icon={FiStar}>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-primary-dark mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">매장 목록을 불러오는 중...</p>
          </div>
        ) : favoriteStores.length === 0 ? (
          <div className="text-center py-12">
            <FiStar className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">관심 매장이 없습니다</h3>
            <p className="text-gray-500 dark:text-gray-400">즐겨찾기한 매장이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteStores.map((store) => (
              <div
                key={store.id}
                className="bg-white dark:bg-[#292929] border border-gray-200 dark:border-gray-500 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-primary-light dark:hover:border-primary-dark transition-all duration-200 group"
                onClick={() => handleStoreClick(store.id)}
              >
                <div className="flex items-center space-x-4">
                  {/* 매장 썸네일 */}
                  <div className="flex-shrink-0">
                    {store.thumbnail_url ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${store.thumbnail_url}`}
                        alt={store.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        <FiStar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* 매장 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                      {store.name}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <FiMapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{getFullAddress(store.address, store.address_detail)}</span>
                    </div>
                  </div>

                  {/* 화살표 아이콘 */}
                  <div className="flex-shrink-0">
                    <FiChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FavoritesModal;
