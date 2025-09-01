import React, { useState, useEffect } from "react";
import { api } from "../api/axios";
import { useTheme } from "../hooks/useTheme";
import { TbReload } from "react-icons/tb";
import { HiX } from "react-icons/hi";

// 매장 승인 대기 데이터 타입
interface PendingStore {
  id: number;
  name: string;
  region_code: string;
  contact: string;
  created_by: number;
  created_at: string;
}

const AdminPage: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "store-approval" | "user-management" | "system-region"
  >("store-approval");

  // 시스템 지역 설정 관련 상태
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // 매장 승인 대기 관련 상태
  const [pendingStores, setPendingStores] = useState<PendingStore[]>([
    {
      id: 1,
      name: "스마트폰 전문점 A",
      region_code: "11000",
      contact: "02-1234-5678",
      created_by: 101,
      created_at: "2024-01-15T14:30:00Z",
    },
    {
      id: 2,
      name: "휴대폰 갤러리 B",
      region_code: "26000",
      contact: "051-9876-5432",
      created_by: 102,
      created_at: "2024-01-16T09:15:00Z",
    },
    {
      id: 3,
      name: "모바일 스토어 C",
      region_code: "41000",
      contact: "031-5555-7777",
      created_by: 103,
      created_at: "2024-01-17T16:45:00Z",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<PendingStore | null>(null);
  const [showModal, setShowModal] = useState(false);

  const syncRegionDataToDb = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const response = await api.post("/admin/regions-sync-db");
      setSyncResult(`${response.message} (총 ${response.totalFetched}건 처리)`);
    } catch (err) {
      setSyncError("DB 동기화 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-6 text-foreground-light dark:text-foreground-dark">
        관리자 페이지
      </h1>

      <div className="bg-white dark:bg-[#292929] rounded-t-lg shadow-lg p-0 mb-0">
        <div className="border-b border-gray-200 dark:border-background-dark">
          <nav className="-mb-px flex gap-6 px-6" aria-label="Tabs">
            <button
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                activeTab === "store-approval"
                  ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onClick={() => setActiveTab("store-approval")}
            >
              매장 등록 승인
            </button>
            <button
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                activeTab === "user-management"
                  ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onClick={() => setActiveTab("user-management")}
            >
              회원 관리
            </button>
            <button
              className={`shrink-0 border-b-2 py-4 px-2 text-base font-semibold transition-colors duration-200 focus:outline-none ${
                activeTab === "system-region"
                  ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onClick={() => setActiveTab("system-region")}
            >
              시스템 지역 설정
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white dark:bg-[#292929] rounded-b-lg shadow-lg px-6 pb-6 pt-6 min-h-[500px]">
        {activeTab === "store-approval" && (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              승인 대기 중인 매장 등록 요청을 관리합니다.
            </p>

            {/* 매장 승인 대기 목록 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  승인 대기 매장 목록
                </h3>
                <button
                  onClick={() => {
                    // TODO: 데이터 새로고침 기능
                    console.log("새로고침");
                  }}
                  className="flex items-center gap-2 px-2 py-1 bg-none hover:bg-primary-light hover:text-white dark:hover:text-black dark:hover:bg-primary-dark text-black dark:text-white rounded-full duration-200"
                >
                  새로고침
                  <TbReload className="w-5 h-5" />
                </button>
              </div>

              {loading ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    데이터를 불러오는 중...
                  </p>
                </div>
              ) : pendingStores.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    승인 대기 중인 매장이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            매장명
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            지역코드
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            연락처
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            등록자 ID
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            등록일
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-background-dark divide-y divide-gray-200 dark:divide-gray-400">
                        {pendingStores.map((store) => (
                          <tr
                            key={store.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => {
                              setSelectedStore(store);
                              setShowModal(true);
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900 dark:text-gray-100">
                              {store.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">
                              {store.region_code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">
                              {store.contact}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">
                              {store.created_by}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">
                              {new Date(store.created_at).toLocaleDateString(
                                "ko-KR",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "user-management" && (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              시스템의 모든 회원을 관리합니다.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                회원 관리 기능이 준비 중입니다.
              </p>
            </div>
          </div>
        )}

        {activeTab === "system-region" && (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              공공 API의 모든 법정동 데이터를 가져와 DB에 저장합니다. (10 ~
              20분정도 소요됩니다.)
            </p>
            <button
              onClick={syncRegionDataToDb}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              disabled={syncing}
            >
              {syncing ? "동기화 진행 중..." : "법정동 데이터 DB 동기화"}
            </button>

            {syncResult && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-700 dark:text-blue-300 font-bold">
                  {syncResult}
                </p>
              </div>
            )}
            {syncError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300">{syncError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 매장 상세정보 모달 */}
      {showModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                매장 상세정보
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  매장명
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedStore.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  지역코드
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedStore.region_code}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  연락처
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedStore.contact}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  등록자 ID
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedStore.created_by}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  등록일
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(selectedStore.created_at).toLocaleDateString(
                    "ko-KR",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  // TODO: 승인 기능
                  console.log("승인:", selectedStore.id);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-200"
              >
                승인
              </button>
              <button
                onClick={() => {
                  // TODO: 거부 기능
                  console.log("거부:", selectedStore.id);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
              >
                거부
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
