import React, { useContext, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

import appleLogo from "../assets/images/apple.png";
import googleLogo from "../assets/images/google.png";
import kakaoLogo from "../assets/images/kakao.png";
import naverLogo from "../assets/images/naver.png";

const ssoProviders = [
  { name: "Apple", logo: appleLogo, alt: "Apple 로그인" },
  { name: "Google", logo: googleLogo, alt: "Google 로그인" },
  { name: "Kakao", logo: kakaoLogo, alt: "Kakao 로그인" },
  { name: "Naver", logo: naverLogo, alt: "Naver 로그인" },
];

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // 미입력 시 포커스를 주기 위한 ref
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const clearInputErrors = (fieldName: "email" | "password") => {
    if (fieldName === "email" && emailError) {
      setEmailError(false);
    }
    if (fieldName === "password" && passwordError) {
      setPasswordError(false);
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleNaverLogin = () => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_NAVER_REDIRECT_URI;

    // CSRF 공격 방지를 위한 state 값 생성
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const state = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    sessionStorage.setItem("naver_oauth_state", state);

    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&state=${state}&redirect_uri=${redirectUri}`;
    window.location.href = naverAuthUrl;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    const isEmailEmpty = !email;
    const isPasswordEmpty = !password;

    // 애니메이션과 에러 메시지를 위해 상태 초기화
    if (isEmailEmpty) setEmailError(false);
    if (isPasswordEmpty) setPasswordError(false);
    setErrorMessage("");

    if (isEmailEmpty || isPasswordEmpty) {
      // DOM 업데이트 후 상태를 다시 설정하여 애니메이션 재시작 및 메시지 표시
      setTimeout(() => {
        setEmailError(isEmailEmpty);
        setPasswordError(isPasswordEmpty);

        if (isEmailEmpty && isPasswordEmpty) {
          setErrorMessage("이메일과 비밀번호를 입력해주세요.");
        } else if (isEmailEmpty) {
          setErrorMessage("이메일을 입력해주세요.");
        } else {
          setErrorMessage("비밀번호를 입력해주세요.");
        }

        if (isEmailEmpty) {
          emailInputRef.current?.focus();
        } else {
          passwordInputRef.current?.focus();
        }
      }, 0);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/user/login",
        {
          email,
          password,
        },
      );

      if (response.status === 200) {
        const { user, token } = response.data;
        if (authContext) {
          authContext.login({
            userId: user.id.toString(),
            nickname: user.nickname,
            userType: user.role,
            token,
          });
          toast.success("로그인에 성공했습니다!");
          navigate("/");
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          toast.error("로그인 중 오류가 발생했습니다.");
        }
      } else {
        toast.error("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-md bg-white dark:bg-[#292929]">
        <h1 className="text-3xl font-bold text-center text-primary-light dark:text-primary-dark">
          PhoneLink
        </h1>
        <form onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                이메일
              </label>
              <input
                ref={emailInputRef}
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearInputErrors("email");
                }}
                onFocus={() => clearInputErrors("email")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:text-white border-gray-300 dark:border-gray-500 ${
                  emailError ? "animate-shake" : ""
                }`}
                placeholder="이메일을 입력하세요"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                비밀번호
              </label>
              <input
                ref={passwordInputRef}
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearInputErrors("password");
                }}
                onFocus={() => clearInputErrors("password")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:text-white border-gray-300 dark:border-gray-500 ${
                  passwordError ? "animate-shake" : ""
                }`}
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-red-500 dark:text-red-400 text-center pb-2">
              {errorMessage || " "}
            </p>

            <button
              type="submit"
              className="w-full px-4 py-2 font-bold text-white rounded-lg bg-primary-light hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:bg-primary-dark dark:hover:bg-opacity-80 dark:text-[#292929]"
            >
              로그인
            </button>
          </div>
        </form>
        <div className="text-sm text-center text-gray-500 dark:text-gray-400">
          <span>회원이 아니신가요? </span>
          <Link
            to="/signup"
            className="font-medium text-primary-light hover:underline dark:text-primary-dark"
          >
            회원가입
          </Link>
        </div>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-500 dark:text-gray-400">
            SNS 계정으로 로그인/회원가입
          </span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* SSO Buttons */}
        <div className="flex justify-center space-x-4">
          {ssoProviders.map((provider) => (
            <button
              key={provider.name}
              onClick={provider.name === "Naver" ? handleNaverLogin : undefined}
              className="w-14 h-14 flex items-center justify-center border-2 border-none dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <img src={provider.logo} alt={provider.alt} className="w-8 h-8" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
