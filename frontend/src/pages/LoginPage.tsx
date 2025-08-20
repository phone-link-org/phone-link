import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!id || !password) {
      toast.error("아이디와 비밀번호를 모두 입력해주세요.");
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
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
              type="text"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
        </div>
        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 font-bold text-white bg-primary-light rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:bg-primary-dark dark:hover:bg-opacity-80"
        >
          로그인
        </button>
        <div className="text-sm text-center">
          <Link
            to="/signup"
            className="font-medium text-primary-light hover:underline dark:text-primary-dark"
          >
            회원이 아니신가요? 회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


