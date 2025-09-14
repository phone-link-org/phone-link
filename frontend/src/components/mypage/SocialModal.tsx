import React, { useEffect, useState } from "react";
import { HiMiniLink, HiMiniLinkSlash } from "react-icons/hi2";

import Modal from "./Modal";
import kakaoIcon from "../../assets/images/kakao.png";
import naverIcon from "../../assets/images/naver.png";
import { api } from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose }) => {
  const handleManageAccount = (provider: string) => {
    // TODO: 실제 소셜계정 관리 로직 구현
    toast.info(`${provider} 연결 / 해제 로직 구현 필요`);
  };
  const { user } = useAuthStore();
  const [isNaver, setIsNaver] = useState(false);
  const [isKakao, setIsKakao] = useState(false);

  useEffect(() => {
    const fetchSocialAccounts = async () => {
      try {
        const userId = user?.id;
        const response = await api.get<{ naver: boolean; kakao: boolean }>(`/user/social-accounts/${userId}`);
        setIsNaver(response.naver);
        setIsKakao(response.kakao);
      } catch (error) {
        console.error("Error fetching social accounts:", error);
        toast.error("소셜 계정 조회 중 오류가 발생했습니다.");
      }
    };
    fetchSocialAccounts();
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="소셜계정 관리">
      <div className="space-y-4">
        {/* 네이버 계정 카드 */}
        <div className="bg-white dark:bg-background-dark rounded-lg border border-gray-200 dark:border-gray-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 네이버 아이콘 */}
              <div className="w-12 h-12 rounded-full bg-[#03C75A] flex items-center justify-center">
                <img src={naverIcon} alt="Naver" className="w-8 h-8" />
              </div>

              {/* 계정 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">네이버</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isNaver ? "연동된 네이버 계정" : "네이버 계정 연동하기"}
                </p>
              </div>
            </div>

            {/* 관리 버튼 */}
            <button
              onClick={() => handleManageAccount("naver")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isNaver ? "bg-red-500 hover:bg-red-600 text-white" : "bg-[#03C75A] hover:bg-[#02B351] text-white"
              }`}
            >
              {isNaver ? (
                <>
                  <HiMiniLinkSlash className="w-4 h-4" />
                  <span className="text-sm font-medium">해제하기</span>
                </>
              ) : (
                <>
                  <HiMiniLink className="w-4 h-4" />
                  <span className="text-sm font-medium">연결하기</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 카카오 계정 카드 */}
        <div className="bg-white dark:bg-background-dark rounded-lg border border-gray-200 dark:border-gray-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 카카오 아이콘 */}
              <div className="w-12 h-12 rounded-full bg-[#FEE500] flex items-center justify-center">
                <img src={kakaoIcon} alt="Kakao" className="w-8 h-8" />
              </div>

              {/* 계정 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">카카오</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isKakao ? "연동된 카카오 계정" : "카카오 계정 연동하기"}
                </p>
              </div>
            </div>

            {/* 관리 버튼 */}
            <button
              onClick={() => handleManageAccount("kakao")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isKakao ? "bg-red-500 hover:bg-red-600 text-white" : "bg-[#FEE500] hover:bg-[#E6CE00] text-[#3C1E1E]"
              }`}
            >
              {isKakao ? (
                <>
                  <HiMiniLinkSlash className="w-4 h-4" />
                  <span className="text-sm font-medium">해제하기</span>
                </>
              ) : (
                <>
                  <HiMiniLink className="w-4 h-4" />
                  <span className="text-sm font-medium">연결하기</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <HiMiniLink className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">소셜계정 관리</h4>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                소셜 계정을 연결하거나 연결된 계정을 해제할 수 있습니다. 연결을 해제할 경우 해당 소셜 계정으로는
                로그인할 수 없습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SocialModal;
