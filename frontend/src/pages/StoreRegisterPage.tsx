import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  HiArrowLeft,
  HiBuildingStorefront,
  HiMapPin,
  HiPhone,
  HiUser,
} from "react-icons/hi2";

interface StoreRegisterFormData {
  store_name: string;
  address: string;
  address_detail: string;
  contect: string; // 연락처 (Store 타입에 맞춰 contect로 유지)
  owner: string;
  region_id: number;
}

const StoreRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<StoreRegisterFormData>({
    store_name: "",
    address: "",
    address_detail: "",
    contect: "",
    owner: "",
    region_id: 0,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof StoreRegisterFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // 지역 데이터 (실제로는 API에서 가져와야 함)
  const regions = [
    { region_id: 1, name: "서울특별시" },
    { region_id: 2, name: "부산광역시" },
    { region_id: 3, name: "대구광역시" },
    { region_id: 4, name: "인천광역시" },
    { region_id: 5, name: "광주광역시" },
    { region_id: 6, name: "대전광역시" },
    { region_id: 7, name: "울산광역시" },
    { region_id: 8, name: "세종특별자치시" },
    { region_id: 9, name: "경기도" },
    { region_id: 10, name: "강원도" },
    { region_id: 11, name: "충청북도" },
    { region_id: 12, name: "충청남도" },
    { region_id: 13, name: "전라북도" },
    { region_id: 14, name: "전라남도" },
    { region_id: 15, name: "경상북도" },
    { region_id: 16, name: "경상남도" },
    { region_id: 17, name: "제주특별자치도" },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // 연락처 입력 시 자동 포맷팅
    if (name === "contect") {
      const formattedPhoneNumber = value
        .replace(/[^0-9]/g, "")
        .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/, "$1-$2-$3")
        .replace(/(-{1,2})$/g, "");

      setFormData((prev) => ({
        ...prev,
        [name]: formattedPhoneNumber,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // 에러 메시지 제거
    if (errors[name as keyof StoreRegisterFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StoreRegisterFormData, string>> = {};

    if (!formData.store_name.trim()) {
      newErrors.store_name = "매장명을 입력해주세요.";
    } else if (formData.store_name.trim().length < 2) {
      newErrors.store_name = "매장명은 2자 이상 입력해주세요.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "주소를 입력해주세요.";
    }

    if (!formData.contect.trim()) {
      newErrors.contect = "연락처를 입력해주세요.";
    } else if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(formData.contect)) {
      newErrors.contect =
        "올바른 연락처 형식을 입력해주세요. (예: 02-1234-5678)";
    }

    if (!formData.owner.trim()) {
      newErrors.owner = "대표자명을 입력해주세요.";
    }

    if (!formData.region_id) {
      newErrors.region_id = "지역을 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("입력 정보를 확인해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 실제로는 API 호출을 통해 매장 등록 요청을 보냄
      // const response = await axios.post(`${SERVER}/api/store/register-request`, formData);

      // 임시로 성공 메시지만 표시
      toast.success("매장 등록 요청이 성공적으로 제출되었습니다.");

      // 잠시 후 이전 페이지로 이동
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("매장 등록 요청 실패:", error);
      toast.error("매장 등록 요청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark mb-4"
          >
            <HiArrowLeft className="h-5 w-5 mr-2" />
            뒤로 가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            매장 등록 요청
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            새로운 매장을 등록하기 위해 필요한 정보를 입력해주세요.
          </p>
        </div>

        <div className="bg-white dark:bg-background-dark rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 매장명 */}
            <div>
              <label
                htmlFor="store_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <HiBuildingStorefront className="inline h-4 w-4 mr-1" />
                매장명 *
              </label>
              <input
                type="text"
                id="store_name"
                name="store_name"
                value={formData.store_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light dark:bg-background-dark dark:border-gray-600 dark:text-white ${
                  errors.store_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="매장명을 입력하세요"
              />
              {errors.store_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.store_name}
                </p>
              )}
            </div>

            {/* 지역 선택 */}
            <div>
              <label
                htmlFor="region_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <HiMapPin className="inline h-4 w-4 mr-1" />
                지역 *
              </label>
              <select
                id="region_id"
                name="region_id"
                value={formData.region_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light dark:bg-background-dark dark:border-gray-600 dark:text-white ${
                  errors.region_id ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value={0}>지역을 선택하세요</option>
                {regions.map((region) => (
                  <option key={region.region_id} value={region.region_id}>
                    {region.name}
                  </option>
                ))}
              </select>
              {errors.region_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.region_id}
                </p>
              )}
            </div>

            {/* 주소 */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <HiMapPin className="inline h-4 w-4 mr-1" />
                주소 *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light dark:bg-background-dark dark:border-gray-600 dark:text-white ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="매장 주소를 입력하세요"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.address}
                </p>
              )}
            </div>

            {/* 상세주소 */}
            <div>
              <label
                htmlFor="address_detail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                상세주소
              </label>
              <input
                type="text"
                id="address_detail"
                name="address_detail"
                value={formData.address_detail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light dark:bg-background-dark dark:border-gray-600 dark:text-white"
                placeholder="상세주소를 입력하세요 (선택사항)"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label
                htmlFor="contect"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <HiPhone className="inline h-4 w-4 mr-1" />
                연락처 *
              </label>
              <input
                type="text"
                id="contect"
                name="contect"
                value={formData.contect}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light dark:bg-background-dark dark:border-gray-600 dark:text-white ${
                  errors.contect ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="연락처를 입력하세요 (예: 02-1234-5678)"
                maxLength={13}
              />
              {errors.contect && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.contect}
                </p>
              )}
            </div>

            {/* 대표자명 */}
            <div>
              <label
                htmlFor="owner"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <HiUser className="inline h-4 w-4 mr-1" />
                대표자명 *
              </label>
              <input
                type="text"
                id="owner"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light dark:bg-background-dark dark:border-gray-600 dark:text-white ${
                  errors.owner ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="대표자명을 입력하세요"
              />
              {errors.owner && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.owner}
                </p>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-light hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-dark dark:hover:bg-primary-light"
              >
                {isSubmitting ? "제출 중..." : "매장 등록 요청 제출"}
              </button>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>안내사항:</strong> 매장 등록 요청은 검토 후 승인됩니다.
                승인 완료 시 이메일로 알려드립니다.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreRegisterPage;
