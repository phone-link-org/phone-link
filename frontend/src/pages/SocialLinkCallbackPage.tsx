import React, { useEffect, useRef } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../api/axios";
import { SSO_PROVIDERS, type SsoProvider } from "../../../shared/constants";

const SocialLinkCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { provider } = useParams<{ provider: SsoProvider }>();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === true) return;
    effectRan.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!provider) {
      toast.error("잘못된 접근입니다. (SSO Provider 없음)");
      window.close();
      return;
    }

    // 🔒 보안 검증: state 값 검증
    if (provider === SSO_PROVIDERS.NAVER) {
      const storedState = sessionStorage.getItem("naver_oauth_state");
      if (state !== storedState) {
        toast.error("비정상적인 접근입니다.");
        window.close();
        return;
      }
      sessionStorage.removeItem("naver_oauth_state");
    } else if (provider === SSO_PROVIDERS.KAKAO) {
      const storedState = sessionStorage.getItem("kakao_oauth_state");
      if (state !== storedState) {
        toast.error("비정상적인 접근입니다.");
        window.close();
        return;
      }
      sessionStorage.removeItem("kakao_oauth_state");
    }

    if (code) {
      const linkAccount = async () => {
        try {
          const response = await api.post(`/auth/link/${provider}`, { code });

          if (response.success) {
            toast.success("소셜 계정이 성공적으로 연동되었습니다.");
          } else {
            toast.error(response.message || "소셜 계정 연동에 실패했습니다.");
          }
        } catch (error: any) {
          console.error("소셜 계정 연동 중 오류:", error);

          if (error.response?.status === 409) {
            toast.error("이미 연동된 소셜 계정입니다.");
          } else if (error.response?.status === 401) {
            toast.error("인증이 필요합니다. 다시 로그인해주세요.");
          } else {
            toast.error("소셜 계정 연동 중 오류가 발생했습니다.");
          }
        } finally {
          // 팝업 창 닫기
          window.close();
        }
      };

      linkAccount();
    } else {
      toast.error(`${provider} 인증에 실패했습니다.`);
      window.close();
    }
  }, [searchParams, provider]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light dark:border-primary-dark mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
          {provider ? `${provider} 계정 연동 중입니다...` : "계정 연동 중입니다..."}
        </p>
        <p className="text-sm text-foreground-light dark:text-foreground-dark mt-2">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default SocialLinkCallbackPage;
