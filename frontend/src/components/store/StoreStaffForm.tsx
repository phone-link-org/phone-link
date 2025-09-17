import React, { useState, useEffect } from "react";
import { FaPhone, FaEnvelope, FaUser } from "react-icons/fa";

// 직원 정보 타입 정의 (UserDto 기반)
interface StaffMember {
  id: number;
  email: string;
  name: string;
  nickname?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "REJECTED";
}

interface StoreStaffFormProps {
  storeId: number;
  isEditable?: boolean;
}

const StoreStaffForm: React.FC<StoreStaffFormProps> = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 데모 데이터 로드
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    setIsLoading(true);
    // 데모 데이터 시뮬레이션
    setTimeout(() => {
      const demoStaff: StaffMember[] = [
        {
          id: 1,
          name: "김철수",
          email: "kim.cs@store.com",
          nickname: "철수",
          phoneNumber: "010-1234-5678",
          profileImageUrl: "/images/profile/kim.jpg",
          status: "ACTIVE",
        },
        {
          id: 2,
          name: "이영희",
          email: "lee.yh@store.com",
          nickname: "영희",
          phoneNumber: "010-2345-6789",
          status: "ACTIVE",
        },
        {
          id: 3,
          name: "박민수",
          email: "park.ms@store.com",
          nickname: "민수",
          phoneNumber: "010-3456-7890",
          profileImageUrl: "/images/profile/park.jpg",
          status: "PENDING",
        },
        {
          id: 4,
          name: "정수진",
          email: "jung.sj@store.com",
          nickname: "수진",
          phoneNumber: "010-4567-8901",
          status: "INACTIVE",
        },
        {
          id: 5,
          name: "최동현",
          email: "choi.dh@store.com",
          nickname: "동현",
          phoneNumber: "010-5678-9012",
          profileImageUrl: "/images/profile/choi.jpg",
          status: "REJECTED",
        },
      ];
      setStaffMembers(demoStaff);
      setIsLoading(false);
    }, 1000);
  };

  // 상태별 스타일과 텍스트
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          text: "재직 중",
          style: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        };
      case "INACTIVE":
        return {
          text: "퇴사",
          style: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        };
      case "PENDING":
        return {
          text: "승인 대기 중",
          style: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
        };
      case "REJECTED":
        return {
          text: "승인 거부",
          style: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
        };
      default:
        return {
          text: "알 수 없음",
          style: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
        };
    }
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
                key={staff.id}
                className="bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-500 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* 직원 기본 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      {/* 프로필 이미지 */}
                      <div className="flex-shrink-0">
                        {staff.profileImageUrl ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}${staff.profileImageUrl}`}
                            alt={staff.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-500"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                            <FaUser className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* 직원 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{staff.name}</h4>
                          {staff.nickname && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">({staff.nickname})</span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">{staff.email}</span>
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

                  {/* 상태 표시 */}
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(staff.status).style}`}
                    >
                      {getStatusInfo(staff.status).text}
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
