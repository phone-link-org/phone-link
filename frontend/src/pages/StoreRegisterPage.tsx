import React, { useState, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { toast } from "sonner";
import { HiBuildingStorefront, HiMapPin, HiPhone, HiUser, HiLink, HiMiniInformationCircle } from "react-icons/hi2";
import type { StoreRegisterFormData, DaumPostcodeData } from "../../../shared/types";
import AddressSearchButton from "../components/AddressSearchButton";
import ImageUpload from "../components/ImageUpload";
import Swal from "sweetalert2";
import { useTheme } from "../hooks/useTheme";
import axios from "axios";

const StoreRegisterPage: React.FC = () => {
  const { theme } = useTheme(); // 현재 테마 가져오기
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<StoreRegisterFormData>({
    name: "",
    regionCode: "",
    address: "",
    addressDetail: "",
    contact: "",
    ownerName: "",
    thumbnailUrl: "",
    link_1: "",
    link_2: "",
    description: "",
    approvalStatus: "PENDING",
    createdBy: 0,
  });
  const [isNameChecked, setIsNameChecked] = useState<boolean>(false);

  const [errors, setErrors] = useState<Partial<Record<keyof StoreRegisterFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const addressDetailRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 매장명이 변경되면 중복 확인 상태 초기화
    if (name === "name") {
      setIsNameChecked(false);
    }

    // 에러 메시지 제거
    if (errors[name as keyof StoreRegisterFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
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

    setFormData((prev) => ({
      ...prev,
      address: fullAddress,
      regionCode: `${data.sigunguCode}00000`,
    }));

    // 상세 주소 필드로 포커스 이동
    addressDetailRef.current?.focus();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StoreRegisterFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "매장명을 입력해주세요.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "매장명은 2자 이상 입력해주세요.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "주소를 입력해주세요.";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "연락처를 입력해주세요.";
    } else if (
      !/^\d{2,4}-\d{3,4}-\d{4}$/.test(formData.contact) &&
      !/^\d{9,12}$/.test(formData.contact.replace(/[^0-9]/g, ""))
    ) {
      newErrors.contact = "올바른 연락처 형식을 입력해주세요.";
    }

    // link_1 URL 유효성 검사
    if (formData.link_1 && formData.link_1.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(formData.link_1.trim())) {
        newErrors.link_1 = "올바른 URL 형식을 입력해주세요.";
      }
    }

    // link_2 URL 유효성 검사
    if (formData.link_2 && formData.link_2.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(formData.link_2.trim())) {
        newErrors.link_2 = "올바른 URL 형식을 입력해주세요.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkStoreName = async (storeName: string) => {
    try {
      // 포커스 이동 처리용 element 변수
      const nameInput = document.getElementById("name") as HTMLInputElement;

      if (!storeName.trim()) {
        toast.error("매장명을 먼저 입력해주세요.");
        if (nameInput) {
          nameInput.focus();
          nameInput.select();
        }
        return;
      }

      const response = await api.get<{ isDuplicate: boolean; message: string }>(`/store/check-name`, {
        params: { inputStoreName: storeName },
      });

      if (response.isDuplicate === false) {
        toast.success("사용 가능한 매장명입니다.");
        setIsNameChecked(true);
      } else {
        toast.error(response.message);
        setIsNameChecked(false);
        nameInput?.focus();
        nameInput?.select();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "매장명 확인 중 오류가 발생했습니다.");
      } else {
        toast.error("매장명 확인 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("입력 정보를 확인해주세요.");
      return;
    }

    // 매장명 중복 확인 여부 검증
    if (!isNameChecked) {
      toast.error("매장명 중복 확인을 진행하세요.");
      // 매장명 필드로 포커스 이동
      const nameInput = document.getElementById("name") as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // 현재 로그인한 사용자의 ID를 formData에 추가
      const requestData = {
        ...formData,
        createdBy: user ? user.id : 0,
      };
      await api.post(`/store/register`, requestData);

      Swal.fire({
        title: "매장 등록 요청 완료",
        html: "관리자 승인 후 판매자 전용 메뉴 접근이 허용됩니다.<br>잠시 후 메인 페이지로 이동합니다.",
        icon: "success",
        timer: 5000,
        showConfirmButton: false,
        background: theme === "dark" ? "#343434" : "#fff",
        color: theme === "dark" ? "#e5e7eb" : "#1f2937",
      });

      // 잠시 후 메인 페이지로 이동
      setTimeout(() => {
        navigate("/");
      }, 5000);
    } catch (error) {
      console.error("매장 등록 요청 실패:", error);
      toast.error("매장 등록 요청 과정에서 오류가 발생했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-6 text-foreground-light dark:text-foreground-dark">매장 등록 요청</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          새로운 매장을 등록하기 위해 필요한 정보를 입력해주세요.
          <br />
          아래 정보들은 매장 등록 후 <b>매장 관리 페이지</b>에서 수정이 가능합니다.
        </p>

        <div className="bg-white dark:bg-[#292929] rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-8">
              {/* --- Left Column --- */}
              <div className="space-y-6">
                {/* 매장명 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <HiBuildingStorefront className="inline h-4 w-4 mr-1" />
                    매장명 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      placeholder="매장명을 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        await checkStoreName(formData.name);
                      }}
                      className="ml-2 flex-shrink-0 whitespace-nowrap border border-transparent px-4 py-2 font-medium text-white dark:text-black bg-primary-light rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:bg-primary-dark dark:hover:bg-opacity-80"
                    >
                      중복 확인
                    </button>
                  </div>
                  <p className="h-4 text-xs text-red-500">{errors.name || " "}</p>
                </div>

                {/* 주소 */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <HiMapPin className="inline h-4 w-4 mr-1" />
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      readOnly
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white ${
                        errors.address ? "border-red-500" : ""
                      }`}
                    />
                    <AddressSearchButton onAddressComplete={handleAddressComplete} />
                  </div>
                  <p className="h-4 text-xs text-red-500">{errors.address || " "}</p>
                </div>

                {/* 상세주소 */}
                <div>
                  <label
                    htmlFor="addressDetail"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    <HiMapPin className="inline h-4 w-4 mr-1" />
                    상세주소
                  </label>
                  <input
                    type="text"
                    id="addressDetail"
                    name="addressDetail"
                    value={formData.addressDetail}
                    onChange={handleChange}
                    ref={addressDetailRef}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                    placeholder="상세주소를 입력하세요"
                  />
                  <p className="h-4 text-xs text-red-500"> </p>
                </div>

                {/* 연락처 */}
                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <HiPhone className="inline h-4 w-4 mr-1" />
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    maxLength={14}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white ${
                      errors.contact ? "border-red-500" : ""
                    }`}
                    placeholder="숫자와 대시(-)만 입력해주세요"
                  />
                  <p className="h-4 text-xs text-red-500">{errors.contact || " "}</p>
                </div>

                {/* 대표자명 */}
                <div>
                  <label
                    htmlFor="ownerName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    <HiUser className="inline h-4 w-4 mr-1" />
                    대표자명
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName ?? ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                    placeholder="대표자명을 입력하세요"
                  />
                </div>
              </div>

              {/* --- Divider --- */}
              <div className="hidden lg:block w-px bg-background-light dark:bg-background-dark" />

              {/* --- Right Column --- */}
              <div className="space-y-6">
                {/* 썸네일 이미지 업로드 */}
                <ImageUpload
                  currentImageUrl={formData.thumbnailUrl}
                  onImageChange={(imageUrl) =>
                    setFormData((prev) => ({
                      ...prev,
                      thumbnailUrl: imageUrl,
                    }))
                  }
                  onImageRemove={() =>
                    setFormData((prev) => ({
                      ...prev,
                      thumbnailUrl: "",
                    }))
                  }
                  label="매장 대표 이미지"
                  uploadType="store"
                />
                {/* 링크 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <HiLink className="inline h-4 w-4 mr-1" />
                    소셜 링크 (카카오 채널 및 블로그 등)
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* 링크 1 */}
                    <div>
                      <input
                        type="url"
                        id="link_1"
                        name="link_1"
                        value={formData.link_1}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                        placeholder="https://pf.kakao.com/example"
                      />
                    </div>

                    {/* 링크 2 */}
                    <div>
                      <input
                        type="url"
                        id="link_2"
                        name="link_2"
                        value={formData.link_2}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white"
                        placeholder="https://blog.naver.com/example"
                      />
                    </div>
                  </div>
                  <p className="h-4 text-xs text-red-500">{errors.link_1 || errors.link_2 || " "}</p>
                </div>
                {/* 매장 소개글 */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    <HiMiniInformationCircle className="inline h-4 w-4 mr-1" />
                    매장 소개글
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full h-[146px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white resize-none"
                    placeholder="매장에 대한 간단한 설명을 입력하세요"
                  />
                </div>
              </div>
            </div>
            {/* 안내 메시지 */}

            <p className="text-md text-red-500 dark:text-red-400 mt-8 text-center">
              매장 등록은 사이트 관리자의 검토 후 승인됩니다.
            </p>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 font-bold text-white dark:text-black bg-primary-light rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:bg-primary-dark dark:hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? "제출 중..." : "매장 등록 요청하기"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default StoreRegisterPage;
