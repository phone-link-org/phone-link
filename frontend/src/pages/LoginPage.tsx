import React, { useContext, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [idError, setIdError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const idInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async () => {
    const isIdEmpty = !id;
    const isPasswordEmpty = !password;

    // 애니메이션과 에러 메시지를 위해 상태 초기화
    if (isIdEmpty) setIdError(false);
    if (isPasswordEmpty) setPasswordError(false);
    setErrorMessage("");

    if (isIdEmpty || isPasswordEmpty) {
      // DOM 업데이트 후 상태를 다시 설정하여 애니메이션 재시작 및 메시지 표시
      setTimeout(() => {
        setIdError(isIdEmpty);
        setPasswordError(isPasswordEmpty);

        if (isIdEmpty && isPasswordEmpty) {
          setErrorMessage("아이디와 비밀번호를 입력해주세요.");
        } else if (isIdEmpty) {
          setErrorMessage("아이디를 입력해주세요.");
        } else {
          // isPasswordEmpty
          setErrorMessage("비밀번호를 입력해주세요.");
        }

        if (isIdEmpty) {
          idInputRef.current?.focus();
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
          id,
          password,
        },
      );

      if (response.status === 200) {
        const { user } = response.data;
        if (authContext) {
          authContext.login({ id: user.id, userType: user.role });
          toast.success("로그인에 성공했습니다!");
          navigate("/");
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("아이디 또는 비밀번호가 올바르지 않습니다.");
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
        <div className="space-y-4">
          <div>
            <label
              htmlFor="id"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              아이디
            </label>
            <input
              ref={idInputRef}
              type="text"
              id="id"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                if (idError) setIdError(false);
                if (errorMessage) setErrorMessage("");
              }}
              onFocus={() => {
                if (idError) setIdError(false);
                if (errorMessage) setErrorMessage("");
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:text-white border-gray-300 dark:border-gray-500 ${
                idError ? "animate-shake" : ""
              }`}
              placeholder="아이디를 입력하세요"
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
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(false);
                if (errorMessage) setErrorMessage("");
              }}
              onFocus={() => {
                if (passwordError) setPasswordError(false);
                if (errorMessage) setErrorMessage("");
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:text-white border-gray-300 dark:border-gray-500 ${
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
            onClick={handleLogin}
            className="w-full px-4 py-2 font-bold text-white rounded-md bg-primary-light hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:bg-primary-dark dark:hover:bg-opacity-80 dark:text-[#292929]"
          >
            로그인
          </button>
        </div>
        <div className="text-sm text-center text-gray-500 dark:text-gray-400">
          <span>회원이 아니신가요? </span>
          <Link
            to="/signup"
            className="font-medium text-primary-light hover:underline dark:text-primary-dark"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
