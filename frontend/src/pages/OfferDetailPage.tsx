import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { format } from "date-fns";
import type { OfferDetailFormData } from "../../../shared/types";
import {
  FiSmartphone,
  FiPhone,
  FiMessageSquare,
  FiExternalLink,
} from "react-icons/fi";
import { CARRIERS, OFFER_TYPES } from "../../../shared/constants";

const formatOfferType = (type?: string): string => {
  switch (type) {
    case OFFER_TYPES.MNP:
      return "번호이동";
    case OFFER_TYPES.CHG:
      return "기기변경";
    default:
      return type || "정보없음";
  }
};

// 개통방식별 색상 설정
const getOfferTypeBadgeColor = (offerType: string) => {
  return offerType === OFFER_TYPES.MNP
    ? "bg-emerald-500 text-white"
    : "bg-amber-500 text-white";
};

// 통신사별 색상 설정
const getCarrierBadgeColor = (carrier: string) => {
  switch (carrier) {
    case CARRIERS.KT:
      return "bg-[#5EDFDE] text-white";
    case CARRIERS.SKT:
      return "bg-[#3618CE] text-white";
    case CARRIERS.LG:
      return "bg-[#E2207E] text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

const OfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [offerFormData, setOfferFormData] =
    useState<OfferDetailFormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfferData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<OfferDetailFormData>(`/offer/${id}`);
        setOfferFormData(response);
      } catch (err) {
        console.error("Error fetching offer data:", err);
        setError("판매 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOfferData();
    }
  }, [id]);

  // 로딩 상태 UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 에러 상태 UI
  if (error || !offerFormData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-xl text-red-500">
          {error || "판매 정보를 찾을 수 없습니다."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          뒤로가기
        </button>
      </div>
    );
  }

  // API의 기본 URL 환경 변수 (이미지 경로를 위해)
  const API_BASE_URL = import.meta.env.VITE_API_URL || "";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      {/* 헤더 */}
      {/* <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-dark transition-colors mb-4"
        >
          <FiChevronLeft className="w-5 h-5" />
          뒤로가기
        </button>
      </div> */}

      {/* 메인 컨텐츠 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 상품 정보 */}
        <div className="lg:col-span-2">
          {/* 상품 정보 */}
          <div className="bg-white dark:bg-[#292929] rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              상품 정보
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-36 h-36 rounded-lg flex-shrink-0">
                {offerFormData.modelImageUrl ? (
                  <img
                    src={`${API_BASE_URL}${offerFormData.modelImageUrl}`}
                    alt={offerFormData.modelName}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <FiSmartphone className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {offerFormData.modelName}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* 통신사 뱃지 */}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getCarrierBadgeColor(offerFormData.carrierName)}`}
                  >
                    {offerFormData.carrierName}
                  </span>

                  {/* 개통방식 뱃지 */}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getOfferTypeBadgeColor(offerFormData.offerType)}`}
                  >
                    {formatOfferType(offerFormData.offerType)}
                  </span>
                </div>
                <p
                  className={`text-3xl font-bold ${
                    offerFormData?.price && offerFormData?.price < 0
                      ? "text-red-500 dark:text-red-400"
                      : "text-primary-light dark:text-primary-dark"
                  }`}
                >
                  {/* offerFormData.price가 null이나 undefined이면 'N/A'를, 아니면 원래 값을 사용 */}
                  {`${offerFormData?.price ?? "N/A"}만원`}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  (요금제: 월 {offerFormData.monthlyFee.toLocaleString("ko-KR")}
                  원)
                </p>
              </div>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="bg-white dark:bg-[#292929] rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              가격 상세
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  출고가:
                </span>
                <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {offerFormData.retailPrice.toLocaleString("ko-KR")}원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  자급제 최저가:
                </span>
                <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {offerFormData?.unlockedPrice &&
                    offerFormData?.unlockedPrice.toLocaleString("ko-KR")}
                  원
                </span>
              </div>
              {offerFormData.coupangLink && (
                <div className="pt-2">
                  <a
                    href={offerFormData.coupangLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiExternalLink />
                    쿠팡에서 자급제 가격 확인하기
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 매장 정보 */}
          <div className="bg-white dark:bg-[#292929] rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              매장 정보
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  매장명:
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {offerFormData.storeName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">주소:</span>
                <span className="font-semibold text-right text-gray-900 dark:text-gray-100">
                  {offerFormData.storeAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  출시일:
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {offerFormData.modelReleaseDate &&
                    format(offerFormData.modelReleaseDate, "yyyy년 MM월 dd일")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 연락처 및 관련 오퍼 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {/* 연락처 정보 */}
            <div className="bg-white dark:bg-[#292929] rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                매장에 문의하기
              </h3>
              <div className="space-y-3">
                {offerFormData.storeContact && (
                  <a
                    href={`tel:${offerFormData.storeContact}`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <FiPhone />
                    전화걸기 ({offerFormData.storeContact})
                  </a>
                )}
                {offerFormData.storeLink_1 && (
                  <a
                    href={offerFormData.storeLink_1}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiMessageSquare />
                    카카오톡 문의
                  </a>
                )}
              </div>
            </div>

            {/* 관련 오퍼 (현재는 정적 UI) */}
            <div className="bg-white dark:bg-[#292929] rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                관련 오퍼
              </h3>
              <div className="space-y-3 text-center text-gray-500">
                {/* TODO: 관련 오퍼 API 연동 */}
                <p>관련 오퍼 정보가 없습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailPage;
