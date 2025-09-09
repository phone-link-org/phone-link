import { Router } from "express";
import axios from "axios";
import { AppDataSource } from "../db";
import { Region } from "../typeorm/regions.entity";
import { Store } from "../typeorm/stores.entity";
import { Seller } from "../typeorm/sellers.entity";
import { isAuthenticated, hasRole } from "../middlewares/auth.middleware";
import { ROLES } from "../../../shared/constants";
import { PhoneModel } from "../typeorm/phoneModels.entity";
import {
  RegionDto,
  PhoneModelGridData,
  PhoneStorageDto,
  PhoneDetailFormData,
} from "../../../shared/types";
import { PhoneStorage } from "../typeorm/phoneStorage.entity";

const router = Router();

// 토큰 확인 & 권한 인증 미들웨어 일괄 적용
router.use(isAuthenticated, hasRole([ROLES.ADMIN]));

router.post("/store-confirm", async (req, res) => {
  const { storeId, approvalStatus, sellerId } = req.body;
  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const storeRepo = transactionalEntityManager.getRepository(Store);
      const sellerRepo = transactionalEntityManager.getRepository(Seller);

      const store = await storeRepo.findOne({ where: { id: storeId } });

      if (!store) {
        throw new Error("해당 매장을 찾을 수 없습니다.");
      }

      // 거부가 아닌 승인일 경우, Seller에 새로운 데이터 추가
      if (approvalStatus === "APPROVED") {
        const newSeller = sellerRepo.create({
          userId: sellerId,
          storeId: storeId,
          status: "ACTIVE",
        });
        await sellerRepo.save(newSeller);
      }

      store.approvalStatus = approvalStatus;
      await storeRepo.save(store);
    });

    // 3. 트랜잭션 성공 후 최종 응답 전송
    res.status(200).json({
      success: true,
      message:
        approvalStatus === "APPROVED"
          ? "매장 승인 처리가 완료되었습니다."
          : "매장 거부 처리가 완료되었습니다.",
    });
  } catch (error) {
    console.error("Error during store confirm transaction:", error);
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
    if (axios.isAxiosError(e) && e.response) {
      return res.status(e.response.status).json(e.response.data);
    }
    res.status(500).json({ message: "Error fetching region data" });
  }
});

router.get("/phone-models", async (req, res) => {
  try {
    const phoneModelRepo = AppDataSource.getRepository(PhoneModel);
    const rows = await phoneModelRepo.find({
      select: ["id", "name_ko", "imageUrl"],
    });

    const data: PhoneModelGridData[] = rows.map((row) => ({
      id: row.id,
      name_ko: row.name_ko,
      imageUrl: row.imageUrl,
    }));

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching phone models:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "핸드폰 모델 정보를 불러오는 중 오류가 발생했습니다.",
    });
  }
});

router.get("/phone-detail/:id", async (req, res) => {
  try {
    const modelId = parseInt(req.params.id);
    if (isNaN(modelId)) {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "유효하지 않은 모델 ID입니다.",
      });
    }

    const query = `
      SELECT pm.id AS modelId,
             pm2.id AS manufacturerId,
             pm2.name_ko AS manufacturerName,
             pm.name_ko AS modelName_ko,
             pm.name_en AS modelName_en,
             pm.image_url AS imageUrl,
             pm.release_date AS releaseDate,
             ps.id AS storageId,
             ps.storage AS storageName,
             pd.retail_price AS retailPrice,
             pd.unlocked_price AS unlockedPrice,
             pd.coupang_link AS coupangLink
      FROM phone_models pm
      JOIN phone_manufacturers pm2 ON pm.manufacturer_id = pm2.id
      JOIN phone_devices pd ON pm.id = pd.model_id
      JOIN phone_storages ps ON pd.storage_id = ps.id
      WHERE pm.id = ?
    `;

    const queryResult = await AppDataSource.query(query, [modelId]);

    if (queryResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "해당 핸드폰 모델 정보를 찾을 수 없습니다.",
      });
    }

    const firstRow = queryResult[0];
    const responseData: PhoneDetailFormData = {
      modelId: firstRow.modelId,
      manufacturerId: firstRow.manufacturerId,
      manufacturerName: firstRow.manufacturerName,
      modelName_ko: firstRow.modelName_ko,
      modelName_en: firstRow.modelName_en,
      imageUrl: firstRow.imageUrl,
      releaseDate: firstRow.releaseDate,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storages: queryResult.map((row: any) => ({
        id: row.storageId,
        storage: row.storageName,
        devices: [
          {
            retailPrice: row.retailPrice,
            unlockedPrice: row.unlockedPrice,
            coupangLink: row.coupangLink,
          },
        ],
      })),
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching phone model detail:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "핸드폰 모델 상세 정보를 불러오는 중 오류가 발생했습니다.",
    });
  }
});

router.get("/phone-storages", async (req, res) => {
  try {
    const phoneStorageRepo = AppDataSource.getRepository(PhoneStorage);
    const rows = await phoneStorageRepo.find({ order: { id: "ASC" } });

    const data: PhoneStorageDto[] = rows.map((row) => ({
      id: row.id,
      storage: row.storage,
    }));

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching phone storages:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "핸드폰 용량 정보를 불러오는 중 오류가 발생했습니다.",
    });
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
