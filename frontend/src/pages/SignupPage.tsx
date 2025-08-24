import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import type { SignupFormData, Store } from "../../../shared/types";

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    name: "",
    birthday: "",
    phone_number: "",
    gender: "M",
    role: "user",
    address: "",
    address_detail: "",
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData | "passwordConfirm", string>>
  >({});
  const [isSsoSignup, setIsSsoSignup] = useState(false);
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [storeId, setStoreId] = useState(""); // 소속 대리점 상태 추가
  const [stores, setStores] = useState<Store[]>([]); // 대리점 목록 상태 추가

  const navigate = useNavigate();
  const location = useLocation();

  const SERVER = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (location.state?.ssoData) {
      const { ssoData, signupToken } = location.state;
      const birthdate =
        ssoData.birth_year && ssoData.birthday
          ? `${ssoData.birth_year}-${ssoData.birthday}`
          : "";

      setFormData((prev) => ({
        ...prev,
        email: ssoData.email || "",
        name: ssoData.name || "",
        gender: ssoData.gender || "M",
        phone_number: ssoData.phone_number?.replace("+82 ", "0") || "",
        birthday: birthdate,
      }));
      setIsSsoSignup(true);
      setSignupToken(signupToken);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get(`${SERVER}/api/store/stores`);
        setStores(response.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
        toast.error("매장 목록을 불러오는데 실패했습니다.");
      }
    };

    fetchStores();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement; // type, checked 속성 접근을 위함

    if (name === "role" && target.type === "checkbox") {
      const isChecked = target.checked;
      setFormData((prev) => ({
        ...prev,
        role: isChecked ? "seller" : "user",
      }));
    } else if (name === "phone_number") {
      const formattedPhoneNumber = value
        .replace(/[^0-9]/g, "") // 숫자 이외의 문자 제거
        .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/, "$1-$2-$3") // 하이픈 추가
        .replace(/(-{1,2})$/g, ""); // 마지막에 붙는 하이픈 제거
      setFormData((prev) => ({
        ...prev,
        [name]: formattedPhoneNumber,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "birth_year" ? Number(value) || undefined : value,
      }));
    }
  };

  const validatePassword = () => {
    const { password } = formData;
    let errorMessage = "";

    if (!password) {
      errorMessage = "비밀번호를 입력해주세요.";
    } else if (password.length < 10) {
      errorMessage = "비밀번호는 10자 이상이어야 합니다.";
    } else if (!/[a-z]/.test(password)) {
      errorMessage = "비밀번호에는 소문자가 포함되어야 합니다.";
    } else if (!/[0-9]/.test(password)) {
      errorMessage = "비밀번호에는 숫자가 포함되어야 합니다.";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errorMessage = "비밀번호에는 특수문자가 포함되어야 합니다.";
    }

    setErrors((prev) => ({ ...prev, password: errorMessage }));
    return errorMessage === "";
  };

  const validatePasswordConfirm = () => {
    if (!passwordConfirm) {
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: "비밀번호를 다시 한번 입력해주세요.",
      }));
      return false;
    }
    if (formData.password !== passwordConfirm) {
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: "비밀번호가 일치하지 않습니다.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, passwordConfirm: "" }));
    return true;
  };

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name } = e.target;
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Partial<
      Record<keyof SignupFormData | "passwordConfirm", string>
    > = {};
    let formIsValid = true;

    // --- Common Fields Validation ---
    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요.";
      formIsValid = false;
    }
    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요.";
      formIsValid = false;
    }
    // 생년월일은 선택 사항
    // if (!formData.birthday) {
    //   newErrors.birthday = "생년월일을 입력해주세요.";
    //   formIsValid = false;
    // }
    // 전화번호는 필수 사항, 입력 시 형식 검사
    if (!formData.phone_number) {
      newErrors.phone_number = "전화번호를 입력해주세요.";
      formIsValid = false;
    } else if (formData.phone_number.length !== 13) {
      newErrors.phone_number = "전화번호 11자리를 올바르게 입력해주세요.";
      formIsValid = false;
    }

    // --- Traditional Signup Fields Validation ---
    if (!isSsoSignup) {
      if (!formData.email) {
        newErrors.email = "이메일을 입력해주세요.";
        formIsValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "올바른 이메일 형식이 아닙니다.";
        formIsValid = false;
      }

      const isPasswordValid = validatePassword();
      const isPasswordConfirmValid = validatePasswordConfirm();
      if (!isPasswordValid || !isPasswordConfirmValid) {
        formIsValid = false;
      }
    }

    setErrors(newErrors);

    if (!formIsValid) {
      toast.error("입력 정보를 다시 확인해주세요.");
      return;
    }

    try {
      const payload = {
        ...formData,
        ...(isSsoSignup && { signupToken }),
      };

      await axios.post(`${SERVER}/api/user/signup`, payload);

      toast.success("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Signup error:", error.response.data);
        toast.error(
          error.response.data.message || "회원가입 중 오류가 발생했습니다.",
        );
      } else {
        console.error("Unexpected error:", error);
        toast.error("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark pt-[63px] pb-6">
      <div className="w-full max-w-lg p-8 space-y-4 rounded-lg shadow-md bg-white dark:bg-[#292929]">
        <h1 className="text-3xl font-bold text-center text-primary-light dark:text-primary-dark">
          {isSsoSignup ? "추가 정보 입력" : "회원가입"}
        </h1>
        <form onSubmit={handleSignup} noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Email */}
            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="phonelink@example.com"
                value={formData.email}
                onChange={handleChange}
                onFocus={handleFocus}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
              />
              <p className="h-4 text-xs text-red-500">{errors.email || " "}</p>
            </div>

            {/* Password */}
            {!isSsoSignup && (
              <>
                <div className="md:col-span-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    onBlur={validatePassword}
                    placeholder="영어 / 숫자 / 특수문자 포함 10자 이상"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                  />
                  <p className="h-4 text-xs text-red-500">
                    {errors.password || " "}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="passwordConfirm"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="passwordConfirm"
                    name="passwordConfirm"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    onBlur={validatePasswordConfirm}
                    placeholder="비밀번호 확인"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                  />
                  <p className="h-4 text-xs text-red-500">
                    {errors.passwordConfirm || " "}
                  </p>
                </div>
              </>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={handleFocus}
                disabled={isSsoSignup}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
              />
              <p className="h-4 text-xs text-red-500">{errors.name || " "}</p>
            </div>

            {/* Gender */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                성별
              </label>
              <div className="grid grid-cols-2">
                {/* 남성 버튼 */}
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={formData.gender === "M"}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    disabled={isSsoSignup}
                    className="sr-only"
                  />
                  <span
                    className={`w-full h-10 flex items-center justify-center text-sm border rounded-l-md cursor-pointer transition-colors duration-200 ${
                      formData.gender === "M"
                        ? "bg-primary-light text-white border-primary-light dark:bg-primary-dark dark:text-[#292929] dark:border-primary-dark"
                        : "bg-white text-gray-700 border-gray-300 dark:bg-transparent dark:text-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                    } ${isSsoSignup ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    남성
                  </span>
                </label>

                {/* 여성 버튼 */}
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="F"
                    checked={formData.gender === "F"}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    disabled={isSsoSignup}
                    className="sr-only"
                  />
                  <span
                    className={`w-full h-10 flex items-center justify-center text-sm border rounded-r-md cursor-pointer transition-colors duration-200 ${
                      formData.gender === "F"
                        ? "bg-primary-light text-white border-primary-light dark:bg-primary-dark dark:text-[#292929] dark:border-primary-dark"
                        : "bg-white text-gray-700 border-gray-300 dark:bg-transparent dark:text-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                    } ${isSsoSignup ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    여성
                  </span>
                </label>
              </div>
              <p className="h-4 mt-1 text-xs text-red-500">
                {errors.gender ? errors.gender : <span>&nbsp;</span>}
              </p>
            </div>

            {/* Birthday */}
            <div>
              <label
                htmlFor="birthday"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                생년월일
              </label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday || ""}
                onChange={handleChange}
                onFocus={handleFocus}
                disabled={isSsoSignup}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
              />
              <p className="h-4 text-xs text-red-500">
                {errors.birthday || " "}
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number || ""}
                onChange={handleChange}
                onFocus={handleFocus}
                maxLength={13}
                placeholder="010-1234-5678"
                disabled={isSsoSignup}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
              />
              <p className="h-4 text-xs text-red-500">
                {errors.phone_number || " "}
              </p>
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                기본 주소
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onFocus={handleFocus}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
              />
              <p className="h-4 text-xs text-red-500">
                {errors.address || " "}
              </p>
            </div>

            {/* Address Detail */}
            <div>
              <label
                htmlFor="address_detail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                상세 주소
              </label>
              <input
                type="text"
                id="address_detail"
                name="address_detail"
                value={formData.address_detail}
                onChange={handleChange}
                onFocus={handleFocus}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
              />
              <p className="h-4 text-xs text-red-500">
                {errors.address_detail || " "}
              </p>
            </div>

            {/* Role */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-center">
                <span className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none">
                  판매자 계정으로 가입을 원할 경우 체크해주세요.
                </span>
                <label htmlFor="role" className="relative cursor-pointer">
                  <input
                    id="role"
                    name="role"
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.role === "seller"}
                    onChange={handleChange}
                  />
                  <div className="w-5 h-5 transition-colors duration-200 border-2 border-gray-300 rounded peer-checked:border-primary-light peer-checked:bg-primary-light dark:border-gray-600 dark:peer-checked:border-primary-dark dark:peer-checked:bg-primary-dark"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 pointer-events-none peer-checked:opacity-100 transition-opacity duration-200">
                    <svg
                      className="w-3 h-3"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </label>
              </div>
            </div>

            {/* Store Selector (Conditional) */}
            {formData.role === "seller" && (
              <>
                <p className="md:col-span-2 text-[13.5px] text-red-500 text-center">
                  판매자 계정 가입인 경우 해당 매장의 관리자의 승인 이후 판매자
                  권한이 부여됩니다.
                </p>
                <div className="md:col-span-2 transition-all duration-300 ease-in-out">
                  <label
                    htmlFor="storeId"
                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    소속 매장 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="storeId"
                    name="storeId"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                  >
                    <option value="">소속 매장을 선택하세요</option>
                    {stores.map((store) => (
                      <option key={store.store_id} value={store.store_id}>
                        {store.store_name}
                      </option>
                    ))}
                  </select>
                  <p className="h-4 mt-1 text-xs text-red-500">
                    {/* {errors.storeId ? errors.storeId : <span>&nbsp;</span>} */}
                    <span>&nbsp;</span>
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 mt-4 font-bold text-white bg-primary-light rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:bg-primary-dark dark:hover:bg-opacity-80"
          >
            {isSsoSignup ? "가입 완료" : "가입하기"}
          </button>
          <div className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
            <span>이미 계정이 있으신가요? </span>
            <Link
              to="/login"
              className="font-medium text-primary-light hover:underline dark:text-primary-dark"
            >
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
