import { Router } from "express";
import axios from "axios";
import { AppDataSource } from "../db";
import { Region } from "../typeorm/regions.entity";
import { RegionDto } from "shared/region.types";
import { Store } from "../typeorm/stores.entity";

const router = Router();

router.post("/store-confirm", async (req, res) => {
  const { storeId, approvalStatus } = req.body;
  try {
    const store = await AppDataSource.getRepository(Store).findOne({
      where: { id: storeId },
    });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "해당 매장의 데이터을 찾을 수 없습니다.",
      });
    }

    store.approvalStatus = approvalStatus;
    await AppDataSource.getRepository(Store).save(store);
    res.status(200).json({
      success: true,
      message:
        approvalStatus === "APPROVED"
          ? "매장 승인 처리가 완료되었습니다."
          : "매장 거부 처리가 완료되었습니다.",
    });
  } catch (error) {
    console.error("Error during store confirm", error);
    res.status(500).json({
      success: false,
      message: "매장 승인 처리 중 오류가 발생했습니다.",
    });
  }
});

router.get("/region", async (req, res) => {
  try {
    const API_KEY = process.env.DATA_GO_KR_REGION_API_KEY;
    if (!API_KEY) {
      throw new Error(
        "API key for data.go.kr is not configured on the server.",
      );
    }
    const baseUrl =
      "https://api.odcloud.kr/api/15123287/v1/uddi:b68902fa-d058-4a17-b188-ff46b7eaaac7";
    const response = await axios.get(baseUrl, {
      params: {
        page: 1,
        perPage: 1000,
        returnType: "JSON",
        serviceKey: API_KEY,
      },
    });

    res.status(200).json(response.data);
  } catch (e) {
    console.error("Error during fetching region data", e);
    // axios 에러인 경우, 공공 API의 응답을 그대로 전달해주는 것이 디버깅에 용이합니다.
    if (axios.isAxiosError(e) && e.response) {
      return res.status(e.response.status).json(e.response.data);
    }
    res.status(500).json({ message: "Error fetching region data" });
  }
});

router.post("/regions-sync-db", async (req, res) => {
  try {
    const API_KEY = process.env.DATA_GO_KR_REGION_API_KEY;
    if (!API_KEY) {
      throw new Error(
        "API key for data.go.kr is not configured on the server.",
      );
    }
    const uddi = "b68902fa-d058-4a17-b188-ff46b7eaaac7"; // 2025-08-28 기준 최신 법정동 데이터 uddi
    const baseUrl = `https://api.odcloud.kr/api/15123287/v1/uddi:${uddi}`;

    const perPage = 10000; //최대 요청 가능 데이터 수
    let page = 1;
    let totalFetched = 0;
    let hasMoreData = true;

    console.log("법정동 데이터 동기화를 시작합니다.");

    while (hasMoreData) {
      console.log(`${page}번째 페이지 데이터를 요청합니다...`);
      const response = await axios.get(baseUrl, {
        params: {
          page: page,
          perPage: perPage,
          returnType: "JSON",
          serviceKey: API_KEY,
        },
      });

      const records = response.data.data; // API 응답에서 실제 데이터 배열을 가져옵니다.
      const fetchedCount = records.length;

      if (fetchedCount > 0) {
        totalFetched += fetchedCount;
        console.log(
          `- ${fetchedCount}건의 데이터를 가져왔습니다. (총 ${totalFetched}건)`,
        );

        const regionRepository = AppDataSource.getRepository(Region);
        const now = new Date();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const regionsToSave: RegionDto[] = records.map((record: any) => ({
          code: record["법정동코드"],
          name: record["법정동명"],
          isActive: record["폐지여부"] === "존재",
          lastSyncedAt: now,
        }));

        await regionRepository.save(regionsToSave);
        console.log(`- ${regionsToSave.length}건을 DB에 저장했습니다.`);
      }

      // 더 이상 가져올 데이터가 없으면 루프를 종료합니다.
      if (fetchedCount < perPage) {
        hasMoreData = false;
        console.log("모든 데이터를 성공적으로 가져왔습니다.");
      } else {
        page++; // 다음 페이지로 이동
      }
    }

    res.status(200).json({
      message: "법정동 데이터 동기화가 완료되었습니다.",
      totalFetched: totalFetched,
    });
  } catch (e) {
    console.error("Error during syncing region data", e);
    if (axios.isAxiosError(e) && e.response) {
      return res.status(e.response.status).json(e.response.data);
    }
    res.status(500).json({ message: "Error syncing region data" });
  }
});

export default router;
