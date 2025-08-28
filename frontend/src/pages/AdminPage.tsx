import React, { useState } from "react";
import apiClient from "../api/axios";

interface RegionData {
  // 응답 데이터 구조에 맞게 타입을 정의합니다.
  // 우선은 any로 설정해두고, 실제 데이터를 보고 구체화할 수 있습니다.
  [key: string]: any;
}

const AdminPage: React.FC = () => {
  const [regionData, setRegionData] = useState<RegionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const fetchRegionData = async () => {
    setLoading(true);
    setError(null);
    setRegionData(null);
    try {
      const response = await apiClient.get("/admin/region-sync-db");

      console.log(response.data);
      setRegionData(response.data);
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncRegionDataToDb = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const response = await apiClient.post("/region/sync-db");
      setSyncResult(
        `${response.data.message} (총 ${response.data.totalFetched}건 처리)`,
      );
    } catch (err) {
      setSyncError("DB 동기화 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
      {/* 내 허락없이 사용금지! */}
      {/* <div className="mt-8 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">데이터베이스 동기화</h2>
        <p className="text-lg text-gray-600 mb-8">
          공공 API의 모든 법정동 데이터를 가져와 DB에 저장합니다. (시간이 오래
          걸릴 수 있습니다)
        </p>
        <button
          onClick={syncRegionDataToDb}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={syncing}
        >
          {syncing ? "동기화 진행 중..." : "법정동 데이터 DB 동기화"}
        </button>

        {syncResult && (
          <p className="text-blue-500 mt-4 font-bold">{syncResult}</p>
        )}
        {syncError && <p className="text-red-500 mt-4">{syncError}</p>}
      </div> */}
    </div>
  );
};

export default AdminPage;
