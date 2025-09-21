import React, { useEffect, useState } from "react";
import { HiMiniLink, HiMiniLinkSlash } from "react-icons/hi2";

import Modal from "./Modal";
import kakaoIcon from "../../assets/images/kakao.png";
import naverIcon from "../../assets/images/naver.png";
import { api } from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useTheme } from "../../hooks/useTheme";
import { SSO_PROVIDERS } from "../../../../shared/constants";
import { ssoConfig } from "../../config/sso-config";

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();

  async function removeAccount(provider: string) {
    const isRemovable = await api.get(`/user/check-unlink/${provider}`);
    console.log(isRemovable);
    if (isRemovable) {
      Swal.fire({
        title: `정말 연결을 해제하시겠습니까?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "해제",
        cancelButtonText: "취소",
        background: theme === "dark" ? "#343434" : "#fff",
        color: theme === "dark" ? "#e5e7eb" : "#1f2937",
        confirmButtonColor: theme === "dark" ? "#9DC183" : "#4F7942",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await api.post(`/auth/unlink/${provider}`);
          if (response) {
            toast.success("연결이 해제되었습니다.");
            if (provider === SSO_PROVIDERS.NAVER) {
              setIsNaver(false);
            } else if (provider === SSO_PROVIDERS.KAKAO) {
              setIsKakao(false);
            }
          } else {
            toast.error("연결 해제 중 오류가 발생했습니다.");
          }
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "연결 해제 불가",
        html: `계정정보 수정을 통해 비밀번호를 설정하신 후<br/>소셜 계정 해제가 가능합니다.<br/>지금은 ${provider} 로그인이 유일한 로그인 방법입니다.`,
        confirmButtonText: "확인",
        background: theme === "dark" ? "#343434" : "#fff",
        color: theme === "dark" ? "#e5e7eb" : "#1f2937",
        confirmButtonColor: theme === "dark" ? "#9DC183" : "#4F7942",
      });
    }
  }

  // CSRF 공격 방지를 위한 state 값 생성
  const getState = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const state = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return state;
  };

  // 🔒 안전한 팝업 기반 소셜 계정 연동
  const handleManageAccount = async (provider: string) => {
    if (provider === SSO_PROVIDERS.NAVER) {
      if (isNaver) {
        removeAccount(provider);
      } else {
        // 🔒 팝업 기반 연동 - CSRF 공격 방지
        const { clientId, authUrl } = ssoConfig.naver;
        const state = getState();
        sessionStorage.setItem("naver_oauth_state", state);

        // 연동 전용 콜백 URL 사용
        const linkCallbackUrl = `${window.location.origin}/social-link/naver/callback`;
        const naverAuthUrl = `${authUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(linkCallbackUrl)}&state=${state}`;

        // 팝업 창으로 소셜 로그인
        const popup = window.open(
          naverAuthUrl,
          "socialLink",
          "width=500,height=600,scrollbars=yes,resizable=yes,left=" +
            (window.screen.width / 2 - 250) +
            ",top=" +
            (window.screen.height / 2 - 300),
        );

        // 팝업에서 코드를 받아서 연동 처리
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // 팝업이 닫히면 연동 상태 다시 확인
            fetchSocialAccounts();
          }
        }, 1000);
      }
    } else if (provider === SSO_PROVIDERS.KAKAO) {
      if (isKakao) {
        removeAccount(provider);
      } else {
        // 🔒 카카오 팝업 기반 연동
        const { clientId, authUrl } = ssoConfig.kakao;
        const state = getState();
        sessionStorage.setItem("kakao_oauth_state", state);

        // 연동 전용 콜백 URL 사용
        const linkCallbackUrl = `${window.location.origin}/social-link/kakao/callback`;
        const kakaoAuthUrl = `${authUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(linkCallbackUrl)}&state=${state}`;

        // 팝업 창으로 소셜 로그인
        const popup = window.open(
          kakaoAuthUrl,
          "socialLink",
          "width=500,height=600,scrollbars=yes,resizable=yes,left=" +
            (window.screen.width / 2 - 250) +
            ",top=" +
            (window.screen.height / 2 - 300),
        );

        // 팝업에서 코드를 받아서 연동 처리
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // 팝업이 닫히면 연동 상태 다시 확인
            fetchSocialAccounts();
          }
        }, 1000);
      }
    }
  };
  const { user } = useAuthStore();
  const [isNaver, setIsNaver] = useState(false);
  const [isKakao, setIsKakao] = useState(false);

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

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchSocialAccounts();
    }
  }, [isOpen, user?.id]);

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
              onClick={() => handleManageAccount(SSO_PROVIDERS.NAVER)}
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
              onClick={() => handleManageAccount(SSO_PROVIDERS.KAKAO)}
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
