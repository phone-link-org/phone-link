import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    id: "",
    password: "",
    name: "",
    phoneNumber: "",
    address: "",
    gender: "male",
    role: "user",
  });
  const [isSsoSignup, setIsSsoSignup] = useState(false);
  const [signupToken, setSignupToken] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // NaverCallbackPage에서 전달된 state가 있는지 확인
    if (location.state && location.state.ssoData) {
      const { ssoData, signupToken } = location.state;
      setFormData((prev) => ({
        ...prev,
        email: ssoData.email || "",
        name: ssoData.name || "",
        gender: ssoData.gender || "male",
        phoneNumber: ssoData.phone_number
          ? ssoData.phone_number.replace("+82 ", "0")
          : "",
      }));
      setIsSsoSignup(true);
      setSignupToken(signupToken);
    }
  }, [location.state]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    // 1. 빈 필드 검사 (SSO 가입 시에는 password 제외)
    const requiredFields = isSsoSignup
      ? { ...formData, password: "temp_password" } // password 검사를 통과시키기 위한 임시값
      : formData;
    if (Object.values(requiredFields).some((value) => value === "")) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    // 2. 이메일 형식 검사
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("유효하지 않은 이메일 형식입니다.");
      return;
    }

    // 3. 전화번호 형식 검사 (010-1234-5678 형식)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("전화번호는 010-1234-5678 형식으로 입력해주세요.");
      return;
    }

    // 4. 비밀번호 규칙 검사 (일반 가입 시에만)
    if (!isSsoSignup) {
      const { password } = formData;
      if (password.length < 12) {
        toast.error("비밀번호는 최소 12자리 이상이어야 합니다.");
        return;
      }
      if (!/[A-Z]/.test(password)) {
        toast.error("비밀번호에는 최소 1개 이상의 대문자가 포함되어야 합니다.");
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        toast.error(
          "비밀번호에는 최소 1개 이상의 특수문자가 포함되어야 합니다.",
        );
        return;
      }
    }

    try {
      const payload = isSsoSignup ? { ...formData, signupToken } : formData;

      const response = await axios.post(
        "http://localhost:4000/api/user/signup",
        payload,
      );

      if (response.status === 201) {
        toast.success("회원가입에 성공했습니다! 로그인 페이지로 이동합니다.");
        navigate("/login");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "회원가입 중 오류 발생");
      } else {
        toast.error("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-lg p-8 space-y-6 rounded-lg shadow-md bg-white dark:bg-[#292929]">
        <h1 className="text-3xl font-bold text-center text-primary-light dark:text-primary-dark">
          {isSsoSignup ? "추가 정보 입력" : "회원가입"}
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600"
            />
          </div>
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
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="사용할 아이디"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {!isSsoSignup && (
            <div className="md:col-span-2">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="영문, 대문자, 특수문자 포함 12자 이상"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSsoSignup}
              placeholder="홍길동"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              전화번호
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={isSsoSignup}
              placeholder="010-1234-5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600"
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              주소
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="거주하시는 주소"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="gender"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              성별
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={isSsoSignup}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600"
            >
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="role"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              역할
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="user">일반 사용자</option>
              <option value="seller">판매자</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleSignup}
          className="w-full px-4 py-2 font-bold text-white bg-primary-light rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:bg-primary-dark dark:hover:bg-opacity-80"
        >
          {isSsoSignup ? "가입 완료" : "가입하기"}
        </button>
        <div className="text-sm text-center">
          <Link
            to="/login"
            className="font-medium text-primary-light hover:underline dark:text-primary-dark"
          >
            이미 계정이 있으신가요? 로그인
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
