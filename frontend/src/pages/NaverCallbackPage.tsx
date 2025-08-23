import React, { useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

const NaverCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const storedState = sessionStorage.getItem("naver_oauth_state");

    if (state !== storedState) {
      toast.error("비정상적인 접근입니다. (state 불일치)");
      navigate("/login");
      return;
    }

    // state 값 검증 후에는 즉시 제거하여 재사용 방지
    sessionStorage.removeItem("naver_oauth_state");

    if (code) {
      const sendCodeToBackend = async (authorizationCode: string) => {
        try {
          const response = await axios.post(
            "http://localhost:4000/api/user/auth/naver/callback",
            {
              code: authorizationCode,
            },
          );

          if (response.status === 200) {
            const { isNewUser, user, token, ssoData, signupToken } =
              response.data;

            if (authContext) {
              if (isNewUser) {
                // 신규 사용자 -> 회원가입 페이지로 이동
                toast.info("추가 정보를 입력하여 회원가입을 완료해주세요.");
                navigate("/signup", {
                  state: { ssoData, signupToken },
                });
              } else {
                // 기존 사용자 -> 로그인 처리
                authContext.login({
                  userId: user.id.toString(),
                  nickname: user.nickname,
                  userType: user.role,
                  token,
                });
                toast.success("네이버 계정으로 로그인되었습니다.");
                navigate("/");
              }
            }
          }
        } catch (error) {
          console.error("네이버 로그인 중 오류가 발생했습니다.", error);
          navigate("/login");
        }
      };

      sendCodeToBackend(code);
    } else {
      toast.error("네이버 인증에 실패했습니다.");
      navigate("/login");
    }
  }, [searchParams, navigate, authContext]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl font-semibold">네이버 로그인 처리 중입니다...</p>
    </div>
  );
};

export default NaverCallbackPage;
