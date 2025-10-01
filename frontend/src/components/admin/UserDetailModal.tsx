import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiCalendar, FiClock, FiAlertCircle, FiHome, FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Listbox, Transition } from "@headlessui/react";
import type { UserDetailDto } from "../../../../shared/user.types";
import { ROLES } from "../../../../shared/constants";
import Modal from "../mypage/Modal";
import LoadingSpinner from "../LoadingSpinner";
import { api } from "../../api/axios";
import kakaoIcon from "../../assets/images/kakao.png";
import naverIcon from "../../assets/images/naver.png";
import googleIcon from "../../assets/images/google.png";
import appleIcon from "../../assets/images/apple.png";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, userId }) => {
  const [userDetail, setUserDetail] = useState<UserDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 정지 관련 상태
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("7"); // 기본값: 7일

  // 정지 기간 옵션
  const suspendDurationOptions = [
    { value: "7", label: "7일" },
    { value: "30", label: "1개월" },
    { value: "365", label: "1년" },
    { value: "permanent", label: "영구" },
  ];

  // 계정 정지 핸들러
  const handleSuspendClick = () => {
    if (!showSuspendForm) {
      // 정지 폼 표시
      setShowSuspendForm(true);
    } else {
      // 실제 정지 API 호출 (추후 구현)
      handleSuspendSubmit();
    }
  };

  // 정지 폼 제출 핸들러
  const handleSuspendSubmit = async () => {
    if (!suspendReason.trim()) {
      setError("정지 사유를 입력해주세요.");
      return;
    }

    // TODO: 실제 정지 API 호출 코드 작성 예정
    console.log("정지 요청:", {
      userId: userId,
      reason: suspendReason,
      duration: suspendDuration,
    });

    // 임시로 성공 처리
    alert(
      `계정이 정지되었습니다.\n사유: ${suspendReason}\n기간: ${suspendDurationOptions.find((opt) => opt.value === suspendDuration)?.label}`,
    );
    setShowSuspendForm(false);
    setSuspendReason("");
    setSuspendDuration("7");
  };

  // 정지 폼 취소 핸들러
  const handleCancelSuspend = () => {
    setShowSuspendForm(false);
    setSuspendReason("");
    setSuspendDuration("7");
  };

  // 사용자 상세 정보 API 호출 함수
  const fetchUserDetail = async (userId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<UserDetailDto>(`/admin/user-detail/${userId}`);

      if (response) {
        setUserDetail(response);
      } else {
        setError("사용자 정보를 불러오는데 실패했습니다.");
      }
    } catch (err: any) {
      console.error("사용자 상세 정보 조회 오류:", err);

      if (err.response?.status === 404) {
        setError("해당 사용자를 찾을 수 없습니다.");
      } else if (err.response?.status === 400) {
        setError("잘못된 요청입니다.");
      } else {
        setError("사용자 정보를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열리고 userId가 있을 때 API 호출
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail(userId);
    } else {
      // 모달이 닫히면 상태 초기화
      setUserDetail(null);
      setError(null);
      setShowSuspendForm(false);
      setSuspendReason("");
      setSuspendDuration("7");
    }
  }, [isOpen, userId]);

  // 모달이 닫혀있거나 사용자 정보가 없으면 렌더링하지 않음
  if (!isOpen) return null;

  // 날짜 포맷팅
  const formatDate = (date: Date | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // role 한글 변환
  const getRoleText = (role: string) => {
    switch (role) {
      case ROLES.ADMIN:
        return "관리자";
      case ROLES.SELLER:
        return "판매자";
      case ROLES.USER:
        return "일반";
      default:
        return role;
    }
  };

  // role 배지 색상
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case ROLES.ADMIN:
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700";
      case ROLES.SELLER:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700";
      case ROLES.USER:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }
  };

  // 상태 한글 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "활성";
      case "SUSPENDED":
        return "정지";
      case "WITHDRAWN":
        return "탈퇴";
      default:
        return status;
    }
  };

  // 상태 배지 색상
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700";
      case "SUSPENDED":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700";
      case "WITHDRAWN":
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }
  };

  // 판매자 상태 한글 변환
  const getSellerStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "재직";
      case "INACTIVE":
        return "퇴사";
      case "PENDING":
        return "승인대기";
      case "REJECTED":
        return "승인거절";
      default:
        return status;
    }
  };

  // 판매자 상태 배지 색상
  const getSellerStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700";
      case "INACTIVE":
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600";
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700";
      case "REJECTED":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }
  };

  // SSO Provider 아이콘 가져오기
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "kakao":
        return kakaoIcon;
      case "naver":
        return naverIcon;
      case "google":
        return googleIcon;
      case "apple":
        return appleIcon;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="회원 상세 정보" icon={FiUser}>
      <div className="space-y-4">
        {/* 로딩 상태 */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner isVisible={true} spinnerSize={48} />
            <span className="ml-3 text-gray-600 dark:text-gray-400">사용자 정보를 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-700">
            <div className="flex items-center gap-2 mb-2">
              <FiAlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">오류 발생</p>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => userId && fetchUserDetail(userId)}
              className="mt-3 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 사용자 정보 표시 (로딩 중이 아니고 에러가 없을 때만) */}
        {!loading && !error && userDetail && (
          <>
            {/* 탈퇴일 (탈퇴 상태인 경우) - 맨 위 */}
            {userDetail.status === "WITHDRAWN" && userDetail.deletedAt && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center gap-2 mb-2">
                  <FiAlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">탈퇴한 회원</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">탈퇴일시</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(userDetail.deletedAt)}</p>
                </div>
              </div>
            )}

            {/* 정지 정보 (정지 상태인 경우) - 맨 위 */}
            {userDetail.status === "SUSPENDED" && userDetail.reason && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-700">
                <div className="flex items-center gap-2 mb-2">
                  <FiAlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">계정 정지 정보</p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">사유</p>
                    <p className="text-sm text-gray-900 dark:text-white">{userDetail.reason}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">정지 일시</p>
                      <p className="text-gray-900 dark:text-white">{formatDate(userDetail.suspendedAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">해제일</p>
                      <p className="text-gray-900 dark:text-white">{formatDate(userDetail.suspendedUntil)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">정지 관리자 ID</p>
                      <p className="text-gray-900 dark:text-white">#{userDetail.suspendedById}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 프로필 섹션 */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg border border-gray-200 dark:border-gray-600">
              {/* 프로필 이미지 */}
              <div className="flex-shrink-0">
                {userDetail.profileImageUrl ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${userDetail.profileImageUrl}`}
                    alt={userDetail.nickname || "프로필"}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-md">
                    <FiUser className="w-7 h-7 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>

              {/* 프로필 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {userDetail.nickname || "닉네임 없음"}
                    </h3>
                    {/* 소셜 로그인 아이콘 */}
                    {userDetail.providers && userDetail.providers.length > 0 && (
                      <div className="flex items-center gap-1">
                        {userDetail.providers.map((provider) => {
                          const icon = getProviderIcon(provider);
                          return icon ? (
                            <img
                              key={provider}
                              src={icon}
                              alt={provider}
                              className="w-5 h-5 rounded-sm object-contain"
                              title={provider}
                            />
                          ) : null;
                        })}
                      </div>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(userDetail.role)} flex-shrink-0`}
                    >
                      {getRoleText(userDetail.role)}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeColor(userDetail.status)} flex-shrink-0`}
                  >
                    {getStatusText(userDetail.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">{userDetail.name}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <FiMail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{userDetail.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <FiPhone className="w-3 h-3 flex-shrink-0" />
                    <span>{userDetail.phoneNumber || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 매장 정보 (판매자인 경우) */}
            {userDetail.role === ROLES.SELLER && userDetail.storeId && userDetail.storeName && (
              <div className="p-3 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">소속 매장 정보</p>
                  {userDetail.sellerStatus && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getSellerStatusBadgeColor(userDetail.sellerStatus)}`}
                    >
                      {getSellerStatusText(userDetail.sellerStatus)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {userDetail.storeThumbnailUrl ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${userDetail.storeThumbnailUrl}`}
                      alt={userDetail.storeName}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                      <FiHome className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/store/${userDetail.storeId}`}
                      className="text-sm font-medium text-primary-light dark:text-primary-dark hover:underline truncate block"
                    >
                      {userDetail.storeName}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 판매자이지만 매장 정보가 없는 경우 */}
            {userDetail.role === ROLES.SELLER && (!userDetail.storeId || !userDetail.storeName) && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-2 mb-2">
                  <FiAlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">매장 정보 없음</p>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  이 사용자는 판매자 권한을 가지고 있지만 소속 매장이 없습니다.
                  {userDetail.sellerStatus && ` (상태: ${getSellerStatusText(userDetail.sellerStatus)})`}
                </p>
              </div>
            )}

            {/* 활동 정보 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-1.5 mb-1">
                  <FiCalendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">가입일</p>
                </div>
                <p className="text-xs text-gray-900 dark:text-white">{formatDate(userDetail.createdAt)}</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-1.5 mb-1">
                  <FiClock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">최근 로그인</p>
                </div>
                <p className="text-xs text-gray-900 dark:text-white">{formatDate(userDetail.lastLoginAt)}</p>
              </div>
            </div>

            {/* 정지 입력 폼 (숨김 처리됨) */}
            {showSuspendForm && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">계정 정지 설정</p>
                  </div>
                  <button
                    onClick={handleCancelSuspend}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    취소
                  </button>
                </div>

                <div className="space-y-3">
                  {/* 정지 사유와 정지 기간을 같은 row에 배치 */}
                  <div className="flex gap-3 items-start">
                    {/* 정지 사유 입력 - 대부분의 width 차지 */}
                    <div className="flex-1">
                      <label htmlFor="suspendReason" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        정지 사유 *
                      </label>
                      <textarea
                        id="suspendReason"
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        placeholder="정지 사유를 입력해주세요..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1f1f1f] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none h-10"
                        rows={1}
                      />
                    </div>

                    {/* 정지 기간 선택 - 필요한 만큼만 width 차지 */}
                    <div className="w-32">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">정지 기간</label>
                      <Listbox value={suspendDuration} onChange={setSuspendDuration}>
                        <div className="relative">
                          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-50 dark:bg-[#1f1f1f] py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent sm:text-sm h-10">
                            <span className="block truncate text-gray-900 dark:text-white">
                              {suspendDurationOptions.find((option) => option.value === suspendDuration)?.label}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <FiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={React.Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 bottom-full mb-1 w-full overflow-auto rounded-md bg-gray-50 dark:bg-[#1f1f1f] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200 dark:border-gray-600">
                              {suspendDurationOptions.map((option) => (
                                <Listbox.Option
                                  key={option.value}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active
                                        ? "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300"
                                        : "text-gray-900 dark:text-white"
                                    }`
                                  }
                                  value={option.value}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                        {option.label}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-600 dark:text-red-400">
                                          <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 관리 버튼 */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              {userDetail.status === "ACTIVE" && (
                <button
                  onClick={handleSuspendClick}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {showSuspendForm ? "정지 확정" : "계정 정지"}
                </button>
              )}
              {userDetail.status === "SUSPENDED" && (
                <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                  정지 해제
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                닫기
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailModal;
