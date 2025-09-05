import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";
import { SSO_PROVIDERS, type SsoProvider } from "../../../shared/constants";

const SsoCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleSocialLoginCallback } = useAuthStore();
  const { provider } = useParams<{ provider: SsoProvider }>(); // URL로부터 provider 동적 추출

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === true) return;
    effectRan.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!provider) {
      toast.error("잘못된 접근입니다. (SSO Provider 없음)");
      navigate("/login");
      return;
    }

    // state 값 검증
    if (provider === SSO_PROVIDERS.NAVER) {
      const storedState = sessionStorage.getItem("naver_oauth_state");
      if (state !== storedState) {
        toast.error("비정상적인 접근입니다. (state 불일치)");
        navigate("/login");
        return;
      }
      sessionStorage.removeItem("naver_oauth_state");
    } else if (provider === SSO_PROVIDERS.KAKAO) {
      const storedState = sessionStorage.getItem("kakao_oauth_state");
      if (state !== storedState) {
        toast.error("비정상적인 접근입니다. (state 불일치)");
        navigate("/login");
        return;
      }
      sessionStorage.removeItem("kakao_oauth_state");
    }
    // TODO: 다른 프로바이더들의 state/nonce 검증 로직 추가 위치

    if (code) {
      const processLogin = async () => {
        try {
          const result = await handleSocialLoginCallback(provider, code);
          if (result.type === "LOGIN_SUCCESS") {
            if (result.status === 202) {
              toast.success("등록을 요청하실 매장 정보를 입력해주세요.");
              navigate("/store/register");
            } else {
              toast.success("로그인되었습니다.");
              navigate("/");
            }
          } else if (result.type === "SIGNUP_REQUIRED") {
            toast.info("추가 정보 입력이 필요합니다.");
            navigate("/signup", {
              state: {
                ssoData: result.ssoData,
                signupToken: result.signupToken,
              },
            });
          }
        } catch (error) {
          console.error(`${provider} 로그인 중 오류가 발생했습니다.`, error);
          toast.error("로그인 처리 중 오류가 발생했습니다.");
          navigate("/login");
        }
      };
      processLogin();
      // const sendCodeToBackend = async (authorizationCode: string) => {
      //   try {
      //     const response = await apiClient.post(
      //       `user/auth/callback/${provider}`,
      //       { code: authorizationCode },
      //     );

      //     if (response.status === 200) {
      //       const { isNewUser, user, token, ssoData, signupToken } =
      //         response.data?.data || {};

      //       if (authContext) {
      //         if (isNewUser) {
      //           toast.info("추가 정보를 입력하여 회원가입을 완료해주세요.");
      //           navigate("/signup", { state: { ssoData, signupToken } });
      //         } else {
      //           authContext.login({
      //             userId: user.id.toString(),
      //             nickname: user.nickname,
      //             userType: user.role,
      //             token,
      //           });
      //           toast.success(`${provider} 계정으로 로그인되었습니다.`);
      //           navigate("/");
      //         }
      //       }
      //     } else if (response.status === 202) {
      //       // seller role이지만 매장 등록이 안된 경우
      //       const { user, token } = response.data?.data || {};

      //       if (authContext) {
      //         authContext.login({
      //           userId: user.id.toString(),
      //           nickname: user.nickname,
      //           userType: user.role,
      //           token,
      //         });
      //         toast.info("매장 등록이 필요합니다.");
      //         navigate("/store/register");
      //       }
      //     }
      //   } catch (error) {
      //     console.error(`${provider} 로그인 중 오류가 발생했습니다.`, error);
      //     toast.error("로그인 처리 중 오류가 발생했습니다.");
      //     navigate("/login");
      //   }
      // };

      // sendCodeToBackend(code);
    } else {
      toast.error(`${provider} 인증에 실패했습니다.`);
      navigate("/login");
    }
  }, [searchParams, navigate, provider]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl font-semibold">
        {provider
          ? `${provider} 로그인 처리 중입니다...`
          : "로그인 처리 중입니다..."}
      </p>
    </div>
  );
};

export default SsoCallbackPage;
