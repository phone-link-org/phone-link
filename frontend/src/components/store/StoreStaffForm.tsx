import React, { useState, useEffect } from "react";
import { FaPhone, FaEnvelope, FaUser } from "react-icons/fa";
import { api } from "../../api/axios";
import type { StoreStaffData } from "../../../../shared/types";

interface StoreStaffFormProps {
  storeId: number;
  isEditable?: boolean;
}

const StoreStaffForm: React.FC<StoreStaffFormProps> = ({ storeId }) => {
  const [staffMembers, setStaffMembers] = useState<StoreStaffData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<StoreStaffData[]>(`/store/${storeId}/staffs`);
        setStaffMembers(response);
      } catch (error) {
        console.error("직원 목록 조회 중 오류가 발생했습니다:", error);
        // 에러 처리 로직 추가 가능 (예: 토스트 메시지, 에러 상태 설정 등)
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaffMembers();
  }, []);

  // 상태별 스타일과 텍스트
  const getStatusInfo = (systemStatus: string, storeStatus: string) => {
    // systemStatus 우선 처리
    if (systemStatus === "SUSPENDED") {
      return {
        text: "이용 정지",
        style: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      };
    }

    if (systemStatus === "WITHDRAWN") {
      return {
        text: "탈퇴한 사용자",
        style: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
      };
    }

    // systemStatus가 ACTIVE인 경우 storeStatus에 따라 처리
    if (systemStatus === "ACTIVE") {
      switch (storeStatus) {
        case "PENDING":
          return {
            text: "승인 대기중",
            style: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
          };
        case "REJECTED":
          return {
            text: "승인 거절",
            style: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
          };
        case "ACTIVE":
          return {
            text: "재직 중",
            style: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
          };
        case "INACTIVE":
          return {
            text: "퇴사",
            style: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
          };
        default:
          return {
            text: "알 수 없음",
            style: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
          };
      }
    }

    // 기본값
    return {
      text: "알 수 없음",
      style: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
    };
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light dark:border-primary-dark mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">직원 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">직원 관리</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">매장 직원 정보를 관리합니다.</p>
        </div>
      </div>

      {/* 직원 목록 */}
      <div className="space-y-4">
        {staffMembers.length === 0 ? (
          <div className="text-center py-12">
            <FaUser className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg text-gray-500 dark:text-gray-400">등록된 직원이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {staffMembers.map((staff) => (
              <div
                key={staff.userId}
                className="bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-500 rounded-lg p-4 sm:p-6 lg:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* 직원 기본 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4 lg:mb-0">
                      {/* 프로필 이미지 */}
                      <div className="flex-shrink-0">
                        {staff.profileImageUrl ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}${staff.profileImageUrl}`}
                            alt={staff.name}
                            className="w-16 h-16 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-500"
                          />
                        ) : (
                          <div className="w-16 h-16 lg:w-12 lg:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                            <FaUser className="w-8 h-8 lg:w-6 lg:h-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* 직원 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 lg:mb-1">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg lg:text-base font-semibold text-gray-900 dark:text-white">
                                {staff.name}
                              </h4>
                              {/* 모바일에서만 상태 배지 표시 */}
                              <span className="lg:hidden">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(staff.systemStatus, staff.storeStatus).style}`}
                                >
                                  {getStatusInfo(staff.systemStatus, staff.storeStatus).text}
                                </span>
                              </span>
                            </div>
                            {staff.nickname && (
                              <span className="text-sm lg:text-xs text-gray-500 dark:text-gray-400">
                                {staff.nickname}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-2 text-sm lg:text-xs">
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-900 dark:text-white truncate">{staff.email}</span>
                          </div>
                          {staff.phoneNumber && (
                            <div className="flex items-center gap-2">
                              <FaPhone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{staff.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 상태 표시 - 큰 화면에서만 표시 */}
                  <div className="hidden lg:flex flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(staff.systemStatus, staff.storeStatus).style}`}
                    >
                      {getStatusInfo(staff.systemStatus, staff.storeStatus).text}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreStaffForm;
