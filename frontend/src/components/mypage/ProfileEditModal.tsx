import React, { useRef } from "react";
import { api } from "../../api/axios";
import { toast } from "sonner";
import AddressSearchButton from "../AddressSearchButton";
import ImageUpload from "../ImageUpload";
import axios from "axios";
import type { UserDto, UserUpdateData } from "../../../../shared/types";
import { ROLES } from "../../../../shared/constants";
import Modal from "./Modal";

interface DaumPostcodeData {
  address: string;
  addressType: "R" | "J";
  bname: string;
  buildingName: string;
  zonecode: string;
  sido: string;
  sigungu: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: UserDto | null;
  setFormData: React.Dispatch<React.SetStateAction<UserDto | null>>;
  newPassword: string;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  passwordConfirm: string;
  setPasswordConfirm: React.Dispatch<React.SetStateAction<string>>;
  errors: Partial<Record<keyof UserUpdateData | "passwordConfirm", string>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof UserUpdateData | "passwordConfirm", string>>>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
  handleWithdrawal: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  newPassword,
  setNewPassword,
  passwordConfirm,
  setPasswordConfirm,
  errors,
  setErrors,
  isSubmitting,
  setIsSubmitting,
  user,
  handleWithdrawal,
}) => {
  const addressDetailRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Password is managed separately
    if (name === "password") {
      setNewPassword(value);
    } else {
      setFormData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: value,
        } as UserDto;
      });
    }

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
        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        address: fullAddress,
      } as UserDto;
    });

    // 상세 주소 필드로 포커스 이동
    addressDetailRef.current?.focus();
  };

  const validatePassword = () => {
    const password = newPassword;
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
    if (newPassword && !passwordConfirm) {
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: "비밀번호를 다시 한번 입력해주세요.",
      }));
      return false;
    }
    if (newPassword && newPassword !== passwordConfirm) {
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: "비밀번호가 일치하지 않습니다.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, passwordConfirm: "" }));
    return true;
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof UserUpdateData | "passwordConfirm", string>> = {};
    let formIsValid = true;

    // 비밀번호 변경 시에만 유효성 검사
    if (newPassword) {
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
      if (!formData) {
        toast.error("사용자 정보를 불러오는 중입니다.");
        return;
      }
      // 비밀번호가 비어있으면 제외
      const updateData: UserUpdateData = {
        id: formData.id,
        nickname: formData.nickname,
        profileImageUrl: formData.profileImageUrl,
        address: formData.address,
        addressDetail: formData.addressDetail,
        postalCode: formData.postalCode,
        sido: formData.sido,
        sigungu: formData.sigungu,
        role: user?.role === ROLES.ADMIN ? ROLES.ADMIN : formData.role,
      };

      if (newPassword) {
        updateData.password = newPassword;
      }

      await api.post("/user/profile", updateData);

      toast.success("프로필이 성공적으로 수정되었습니다.");

      // 비밀번호 필드 초기화
      setNewPassword("");
      setPasswordConfirm("");

      // 모달 닫기
      onClose();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Profile update error:", error.response.data);
        toast.error(error.response.data.message || "프로필 수정 중 오류가 발생했습니다.");
      } else {
        console.error("Unexpected error:", error);
        toast.error("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRole = () => {
    setFormData((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        role: previous.role === ROLES.SELLER ? ROLES.USER : ROLES.SELLER,
      } as UserDto;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="계정 정보 수정">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-8">
          {/* --- Left Column --- */}
          <div className="space-y-4">
            {/* Email - 읽기전용 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={formData?.email ?? ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                새 비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={newPassword}
                onChange={handleChange}
                onBlur={validatePassword}
                onFocus={handleFocus}
                placeholder="변경하려면 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
              />
              <p className="h-4 text-xs text-red-500">{errors.password || " "}</p>
            </div>

            {/* Password Confirm */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <p className="h-4 text-xs text-red-500">{errors.passwordConfirm || " "}</p>
            </div>

            {/* Nickname */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                닉네임
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData?.nickname ?? ""}
                onChange={handleChange}
                onFocus={handleFocus}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
              />
            </div>

            {/* Gender - 읽기전용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">성별</label>
              <input
                type="text"
                value={formData?.gender === "M" ? "남성" : formData?.gender === "F" ? "여성" : ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 cursor-not-allowed"
              />
            </div>

            {/* Birthday */}
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                생년월일
              </label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData?.birthday ?? ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 cursor-not-allowed"
              />
            </div>

            {/* Phone Number - 읽기전용 */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                전화번호
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData?.phoneNumber ?? ""}
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
              currentImageUrl={formData?.profileImageUrl ?? ""}
              onImageChange={(imageUrl) =>
                setFormData((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    profileImageUrl: imageUrl,
                  } as UserDto;
                })
              }
              onImageRemove={() =>
                setFormData((prev) => {
                  if (!prev) return prev;
                  return { ...prev, profileImageUrl: "" } as UserDto;
                })
              }
              label="프로필 이미지"
              uploadType="profile"
            />

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                기본 주소
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData?.address ?? ""}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                />
                <AddressSearchButton onAddressComplete={handleAddressComplete} />
              </div>
            </div>

            {/* Address Detail */}
            <div>
              <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                상세 주소
              </label>
              <input
                type="text"
                id="addressDetail"
                name="addressDetail"
                value={formData?.addressDetail ?? ""}
                onChange={handleChange}
                onFocus={handleFocus}
                ref={addressDetailRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
              />
            </div>

            {/* Role Toggle */}
            {user && user.role !== ROLES.ADMIN && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">계정 유형</label>
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
                      checked={formData?.role === ROLES.SELLER}
                      onChange={toggleRole}
                    />
                    <div className="w-11 h-6 transition-colors duration-200 bg-gray-200 rounded-full peer peer-checked:bg-primary-light dark:bg-gray-700 dark:peer-checked:bg-primary-dark peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none">판매자</span>
                </div>
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  {formData?.role === ROLES.SELLER
                    ? "판매자 계정으로 변경 시 매장 관리 기능을 사용할 수 있습니다."
                    : "일반 사용자 계정입니다."}
                </p>
              </div>
            )}
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
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={handleWithdrawal}
            className="text-sm text-gray-400 hover:text-red-700 dark:text-white-900 dark:hover:text-red-300 underline"
          >
            회원 탈퇴
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileEditModal;
