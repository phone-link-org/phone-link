import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../api/axios";
import { toast } from "sonner";
import AddressSearchButton from "../components/AddressSearchButton";
import ImageUpload from "../components/ImageUpload";
import axios from "axios";
import type { UserDto } from "../../../shared/types";

interface DaumPostcodeData {
  address: string;
  addressType: "R" | "J";
  bname: string;
  buildingName: string;
  zonecode: string;
  sido: string;
  sigungu: string;
}

interface UserUpdateData {
  nickname?: string;
  password?: string;
  profileImageUrl?: string;
  address?: string;
  addressDetail?: string;
  role?: "USER" | "SELLER";
}

const MyPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const navigate = useNavigate();
  const addressDetailRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UserDto>({
    id: 999,
    nickname: "테스트용",
    email: "test@test.com",
    password: "",
    profileImageUrl: "",
    address: "서울특별시 도봉구 도봉로 169길 31",
    addressDetail: "102동 110호",
    role: "USER",
    status: "ACTIVE",
    name: "홍길동",
    gender: "M",
    birthday: "1998-03-09",
    phoneNumber: "010-1234-5678",
    createdAt: new Date(),
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserUpdateData | "passwordConfirm", string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // AuthProvider가 로드되고 user 상태가 확정된 후, 비로그인 상태라면 리다이렉트
    if (authContext !== null && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate, authContext]);

  // 리다이렉션이 실행되기 전에 컴포넌트 내용이 잠시 보이는 것을 방지
  if (!user) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 에러 메시지 제거
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddressComplete = (data: DaumPostcodeData) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setFormData((prev) => ({
      ...prev,
      address: fullAddress,
    }));

    // 상세 주소 필드로 포커스 이동
    addressDetailRef.current?.focus();
  };

  const validatePassword = () => {
    const { password } = formData;
    let errorMessage = "";

    if (password && password.length > 0) {
      if (password.length < 10) {
        errorMessage = "비밀번호는 10자 이상이어야 합니다.";
      } else if (!/[a-z]/.test(password)) {
        errorMessage = "비밀번호에는 소문자가 포함되어야 합니다.";
      } else if (!/[0-9]/.test(password)) {
        errorMessage = "비밀번호에는 숫자가 포함되어야 합니다.";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errorMessage = "비밀번호에는 특수문자가 포함되어야 합니다.";
      }
    }

    setErrors((prev) => ({ ...prev, password: errorMessage }));
    return errorMessage === "";
  };

  const validatePasswordConfirm = () => {
    if (formData.password && !passwordConfirm) {
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: "비밀번호를 다시 한번 입력해주세요.",
      }));
      return false;
    }
    if (formData.password && formData.password !== passwordConfirm) {
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
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name } = e.target;
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Partial<
      Record<keyof UserUpdateData | "passwordConfirm", string>
    > = {};
    let formIsValid = true;

    // 비밀번호 변경 시에만 유효성 검사
    if (formData.password) {
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

    setIsSubmitting(true);

    try {
      // 비밀번호가 비어있으면 제외
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      //await api.put("/user/profile", updateData);

      toast.success("프로필이 성공적으로 수정되었습니다.");

      // 비밀번호 필드 초기화
      setFormData((prev) => ({ ...prev, password: "" }));
      setPasswordConfirm("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Profile update error:", error.response.data);
        toast.error(
          error.response.data.message || "프로필 수정 중 오류가 발생했습니다.",
        );
      } else {
        console.error("Unexpected error:", error);
        toast.error("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawal = async () => {
    if (
      window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    ) {
      try {
        //await api.delete("/user/withdraw");
        toast.success("회원 탈퇴가 완료되었습니다.");
        navigate("/");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(
            error.response.data.message || "회원 탈퇴 중 오류가 발생했습니다.",
          );
        } else {
          toast.error("회원 탈퇴 중 알 수 없는 오류가 발생했습니다.");
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark pt-[63px] pb-6">
      <div className="w-full max-w-4xl p-8 space-y-6 rounded-lg shadow-md bg-white dark:bg-[#292929]">
        <h1 className="text-3xl font-bold text-center text-primary-light dark:text-primary-dark">
          마이페이지
        </h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-8">
            {/* --- Left Column --- */}
            <div className="space-y-4">
              {/* Email - 읽기전용 */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  새 비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={""}
                  onChange={handleChange}
                  onBlur={validatePassword}
                  onFocus={handleFocus}
                  placeholder="변경하려면 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                />
                <p className="h-4 text-xs text-red-500">
                  {errors.password || " "}
                </p>
              </div>

              {/* Password Confirm */}
              <div>
                <label
                  htmlFor="passwordConfirm"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  id="passwordConfirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  onBlur={validatePasswordConfirm}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                />
                <p className="h-4 text-xs text-red-500">
                  {errors.passwordConfirm || " "}
                </p>
              </div>

              {/* Nickname */}
              <div>
                <label
                  htmlFor="nickname"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  닉네임
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                />
              </div>

              {/* Gender - 읽기전용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  성별
                </label>
                <input
                  type="text"
                  value={formData.gender}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 cursor-not-allowed"
                />
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
                  value={formData.birthday}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 cursor-not-allowed"
                />
              </div>

              {/* Phone Number - 읽기전용 */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  전화번호
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 cursor-not-allowed"
                />
              </div>
            </div>

            {/* --- Divider --- */}
            <div className="hidden lg:block w-px bg-background-light dark:bg-background-dark" />

            {/* --- Right Column --- */}
            <div className="space-y-4">
              {/* Profile Image */}
              <ImageUpload
                currentImageUrl={formData.profileImageUrl}
                onImageChange={(imageUrl) =>
                  setFormData((prev) => ({
                    ...prev,
                    profileImageUrl: imageUrl,
                  }))
                }
                onImageRemove={() =>
                  setFormData((prev) => ({ ...prev, profileImageUrl: "" }))
                }
                label="프로필 이미지"
              />

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  기본 주소
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                  />
                  <AddressSearchButton
                    onAddressComplete={handleAddressComplete}
                  />
                </div>
              </div>

              {/* Address Detail */}
              <div>
                <label
                  htmlFor="addressDetail"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  상세 주소
                </label>
                <input
                  type="text"
                  id="addressDetail"
                  name="addressDetail"
                  value={formData.addressDetail}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  ref={addressDetailRef}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                />
              </div>

              {/* Role Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  계정 유형
                </label>
                <div className="flex items-center justify-center">
                  <span className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none">
                    일반 사용자
                  </span>
                  <label htmlFor="role" className="relative cursor-pointer">
                    <input
                      id="role"
                      name="role"
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.role === "SELLER"}
                      onChange={handleChange}
                    />
                    <div className="w-11 h-6 transition-colors duration-200 bg-gray-200 rounded-full peer peer-checked:bg-primary-light dark:bg-gray-700 dark:peer-checked:bg-primary-dark peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none">
                    판매자
                  </span>
                </div>
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  {formData.role === "SELLER"
                    ? "판매자 계정으로 변경 시 매장 관리 기능을 사용할 수 있습니다."
                    : "일반 사용자 계정입니다."}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 mt-6 font-bold text-white dark:text-black bg-primary-light rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:bg-primary-dark dark:hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "수정 중..." : "수정"}
          </button>

          {/* Withdrawal Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleWithdrawal}
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
            >
              회원 탈퇴
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyPage;
