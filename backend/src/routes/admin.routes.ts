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
  PhoneDetailFormData,
  PhoneManufacturerDto,
  CarrierDto,
  PhoneStorageDto,
} from "../../../shared/types";
import { PhoneStorage } from "../typeorm/phoneStorage.entity";
import { PhoneDevice } from "../typeorm/phoneDevices.entity";
import { PhoneManufacturer } from "../typeorm/phoneManufacturers.entity";
import { Carrier } from "../typeorm/carriers.entity";

const router = Router();

// 토큰 확인 & 권한 인증 미들웨어 일괄 적용
router.use(isAuthenticated, hasRole([ROLES.ADMIN]));

// #region Store Confirmation
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
      message: approvalStatus === "APPROVED" ? "매장 승인 처리가 완료되었습니다." : "매장 거부 처리가 완료되었습니다.",
    });
  } catch (error) {
    console.error("Error during store confirm transaction:", error);
    res.status(500).json({
      success: false,
      message: "매장 승인 처리 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});
// #endregion

// #region Phone Models
router.get("/phone-models", async (req, res) => {
  try {
    const phoneModelRepo = AppDataSource.getRepository(PhoneModel);
    const rows = await phoneModelRepo.find({
      select: ["id", "name_ko", "imageUrl"],
    });

    const result: PhoneModelGridData[] = rows.map((row) => ({
      id: row.id,
      name_ko: row.name_ko,
      imageUrl: row.imageUrl,
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching phone models:", error);
    res.status(500).json({
      success: false,
      message: "핸드폰 모델 정보를 불러오는 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

router.get("/phone-detail/:id", async (req, res) => {
  try {
    const modelId = parseInt(req.params.id);
    if (isNaN(modelId)) {
      return res.status(400).json({ message: "유효하지 않은 모델 ID입니다." });
    }

    const modelRepo = AppDataSource.getRepository(PhoneModel);
    const model = await modelRepo.findOne({
      where: { id: modelId },
      relations: ["manufacturer", "devices", "devices.storage"],
    });

    if (!model) {
      return res.status(404).json({ message: "해당 핸드폰 모델 정보를 찾을 수 없습니다." });
    }

    const responseData: PhoneDetailFormData = {
      modelId: model.id,
      manufacturerId: model.manufacturer.id,
      manufacturerName: model.manufacturer.name_ko,
      modelName_ko: model.name_ko,
      modelName_en: model.name_en,
      imageUrl: model.imageUrl,
      releaseDate: model.releaseDate,
      storages: model.devices.map((device) => ({
        id: device.storage.id,
        storage: device.storage.storage,
        devices: [
          {
            retailPrice: device.retailPrice,
            unlockedPrice: device.unlockedPrice,
            coupangLink: device.coupangLink,
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
      message: "핸드폰 모델 상세 정보를 불러오는 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

router.post("/phone-detail/:id", async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const idParam = req.params.id;
    const modelId = idParam === "null" || isNaN(parseInt(idParam, 10)) ? null : parseInt(idParam, 10);
    const data: PhoneDetailFormData = req.body;

    // 1. 필수 정보 유효성 검사
    if (!data.modelName_ko || !data.modelName_en || !data.imageUrl || !data.releaseDate) {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "필수 정보가 누락되었습니다.",
      });
    }

    const modelRepo = queryRunner.manager.getRepository(PhoneModel);
    const deviceRepo = queryRunner.manager.getRepository(PhoneDevice);
    const existingModel = modelId ? await modelRepo.findOne({ where: { id: modelId } }) : null;

    if (existingModel) {
      // --- UPDATE LOGIC ---
      // 3-A. 기존 모델 정보가 변경되었는지 확인하고 업데이트
      const modelNeedsUpdate =
        existingModel.manufacturerId !== data.manufacturerId ||
        existingModel.name_ko !== data.modelName_ko ||
        existingModel.name_en !== data.modelName_en ||
        existingModel.imageUrl !== data.imageUrl ||
        existingModel.releaseDate !== data.releaseDate;

      if (modelNeedsUpdate) {
        existingModel.manufacturerId = data.manufacturerId;
        existingModel.name_ko = data.modelName_ko;
        existingModel.name_en = data.modelName_en;
        existingModel.imageUrl = data.imageUrl;
        existingModel.releaseDate = data.releaseDate;
        await modelRepo.save(existingModel);
      }

      // 3-B. PhoneDevice 동기화 (추가/수정/삭제)
      const existingDevices = await deviceRepo.find({
        where: { modelId: existingModel.id },
      });
      const existingDevicesMap = new Map(existingDevices.map((d) => [d.storageId, d]));
      const incomingStoragesMap = new Map(data.storages.map((s) => [s.id, s]));

      const devicesToAdd = [];
      const devicesToUpdate = [];
      const devicesToDelete = [];

      // 삭제할 디바이스 찾기 (DB에는 있지만, 요청 데이터에는 없는 경우)
      for (const existingDevice of existingDevices) {
        if (!incomingStoragesMap.has(existingDevice.storageId)) {
          devicesToDelete.push(existingDevice);
        }
      }

      // 추가 또는 수정할 디바이스 찾기
      for (const incomingStorage of data.storages) {
        const existingDevice = existingDevicesMap.get(incomingStorage.id);

        if (existingDevice) {
          // 수정할 디바이스
          const deviceNeedsUpdate =
            existingDevice.retailPrice !== incomingStorage.devices[0].retailPrice ||
            existingDevice.unlockedPrice !== incomingStorage.devices[0].unlockedPrice ||
            existingDevice.coupangLink !== incomingStorage.devices[0].coupangLink;

          if (deviceNeedsUpdate) {
            existingDevice.retailPrice = incomingStorage.devices[0].retailPrice;
            existingDevice.unlockedPrice = incomingStorage.devices[0].unlockedPrice;
            existingDevice.coupangLink = incomingStorage.devices[0].coupangLink;
            devicesToUpdate.push(existingDevice);
          }
        } else {
          // 추가할 디바이스
          const newDevice = new PhoneDevice();
          newDevice.modelId = existingModel.id;
          newDevice.storageId = incomingStorage.id;
          newDevice.retailPrice = incomingStorage.devices[0].retailPrice;
          newDevice.unlockedPrice = incomingStorage.devices[0].unlockedPrice;
          newDevice.coupangLink = incomingStorage.devices[0].coupangLink;
          devicesToAdd.push(newDevice);
        }
      }

      // DB에 변경사항 적용
      if (devicesToDelete.length > 0) await deviceRepo.remove(devicesToDelete);
      if (devicesToUpdate.length > 0) await deviceRepo.save(devicesToUpdate);
      if (devicesToAdd.length > 0) await deviceRepo.save(devicesToAdd);

      await queryRunner.commitTransaction();
      return res.status(200).json({
        success: true,
        message: "핸드폰 모델 정보가 성공적으로 수정되었습니다.",
      });
    } else {
      // 4. 새 모델 생성
      const newModel = new PhoneModel();
      newModel.manufacturerId = data.manufacturerId;
      newModel.name_ko = data.modelName_ko;
      newModel.name_en = data.modelName_en;
      newModel.imageUrl = data.imageUrl;
      newModel.releaseDate = data.releaseDate;
      const savedModel = await modelRepo.save(newModel);

      const devicesToSave = data.storages.map((storage) => {
        const deviceData = new PhoneDevice();
        deviceData.storageId = storage.id;
        deviceData.modelId = savedModel.id;
        deviceData.retailPrice = storage.devices[0].retailPrice;
        deviceData.unlockedPrice = storage.devices[0].unlockedPrice;
        deviceData.coupangLink = storage.devices[0].coupangLink;
        return deviceData;
      });

      if (devicesToSave.length > 0) {
        await deviceRepo.save(devicesToSave);
      }

      await queryRunner.commitTransaction();
      return res.status(201).json({
        success: true,
        message: "핸드폰 모델이 성공적으로 생성되었습니다.",
      });
    }
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error processing phone model detail:", error);
    return res.status(500).json({
      success: false,
      message: "요청 처리 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  } finally {
    await queryRunner.release();
  }
});
// #endregion

// #region Storages
router.get("/storages", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(PhoneStorage);
    const data = await repo.find({ order: { id: "ASC" } });
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching storages:", error);
    res.status(500).json({
      success: false,
      message: "용량 정보 조회 중 오류 발생",
      error: "Internal Server Error",
    });
  }
});

router.get("/storage/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const repo = AppDataSource.getRepository(PhoneStorage);
    const data = await repo.findOneBy({ id });
    if (!data) return res.status(404).json({ message: "Not Found" });
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching storage:", error);
    res.status(500).json({
      success: false,
      message: "용량 정보 조회 중 오류 발생",
      error: "Internal Server Error",
    });
  }
});

router.post("/storage", async (req, res) => {
  try {
    const storage: PhoneStorageDto = req.body;
    const repo = AppDataSource.getRepository(PhoneStorage);

    let result;
    if (storage.id) {
      //id가 존재하면 수정
      const id = storage.id;
      const dataToUpdate = await repo.findOneBy({ id });
      if (!dataToUpdate) {
        return res.status(404).json({
          success: false,
          message: "Not Found",
        });
      }
      dataToUpdate.storage = storage.storage;
      result = await repo.save(dataToUpdate);
    } else {
      //id가 존재하지 않으면 생성
      result = await repo.save(storage);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating storage:", error);
    res.status(500).json({
      success: false,
      message: "용량 정보 생성 중 오류 발생",
      error: "Internal Server Error",
    });
  }
});
// #endregion

// #region Manufacturers
router.get("/manufacturers", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(PhoneManufacturer);
    const data = await repo.find({ order: { id: "ASC" } });
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    res.status(500).json({
      success: false,
      message: "제조사 정보 조회 중 오류 발생",
      error: "Internal Server Error",
    });
  }
});

router.get("/manufacturer/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const repo = AppDataSource.getRepository(PhoneManufacturer);
    const data = await repo.findOneBy({ id });
    if (!data) return res.status(404).json({ message: "Not Found" });
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching manufacturer:", error);
    res.status(500).json({
      success: false,
      message: "제조사 정보 조회 중 오류 발생",
      error: "Internal Server Error",
    });
  }
});

router.post("/manufacturer", async (req, res) => {
  try {
    const manufacturer: PhoneManufacturerDto = req.body;
    const repo = AppDataSource.getRepository(PhoneManufacturer);
    let result;
    if (manufacturer.id) {
      const id = manufacturer.id;
      const dataToUpdate = await repo.findOneBy({ id });
      if (!dataToUpdate) {
        return res.status(404).json({
          success: false,
          message: "Not Found",
        });
      }

      dataToUpdate.name_ko = manufacturer.name_ko;
      dataToUpdate.name_en = manufacturer.name_en;
      result = await repo.save(dataToUpdate);
    } else {
      const newData = repo.create(manufacturer);
      result = await repo.save(newData);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating manufacturer:", error);
    res.status(500).json({
      success: false,
      message: "제조사 정보 갱신 중 오류 발생",
      error: "Internal Server Error",
    });
  }
});
// #endregion

// #region Carriers
router.get("/carriers", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Carrier);
    const data = await repo.find({ order: { id: "ASC" } });
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching carriers:", error);
    res.status(500).json({
      success: false,
      message: "통신사 정보 조회 중 오류 발생",
      error: "Internal Server Error",
    });
  }
});

router.get("/carrier/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const repo = AppDataSource.getRepository(Carrier);
    const data = await repo.findOneBy({ id });
    if (!data) return res.status(404).json({ message: "Not Found" });
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching carrier:", error);
    res.status(500).json({
      success: false,
      message: "통신사 정보 조회 중 오류 발생",
      error: "Internal Server Error",
    });
  }
});

router.post("/carrier", async (req, res) => {
  try {
    const carrier: CarrierDto = req.body;
    const repo = AppDataSource.getRepository(Carrier);

    let result;
    if (carrier.id) {
      const id = carrier.id;
      const dataToUpdate = await repo.findOneBy({ id });
      if (!dataToUpdate) {
        return res.status(404).json({
          success: false,
          message: "Not Found",
        });
      }

      dataToUpdate.name = carrier.name;
      dataToUpdate.imageUrl = carrier.imageUrl || "";
      result = await repo.save(dataToUpdate);
    } else {
      const newData = repo.create(carrier);
      result = await repo.save(newData);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating carrier:", error);
    res.status(500).json({
      success: false,
      message: "통신사 정보 갱신 중 오류 발생",
      error: "Internal Server Error",
    });
  }
});

// #endregion

// #region Region Sync
router.get("/region", async (req, res) => {
  try {
    const API_KEY = process.env.DATA_GO_KR_REGION_API_KEY;
    if (!API_KEY) {
      throw new Error("API key for data.go.kr is not configured on the server.");
    }
    const baseUrl = "https://api.odcloud.kr/api/15123287/v1/uddi:b68902fa-d058-4a17-b188-ff46b7eaaac7";
    const response = await axios.get(baseUrl, {
      params: {
        page: 1,
        perPage: 1000,
        returnType: "JSON",
        serviceKey: API_KEY,
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (e) {
    console.error("Error during fetching region data", e);
    if (axios.isAxiosError(e) && e.response) {
      return res.status(e.response.status).json(e.response.data);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching region data",
      error: "Internal Server Error",
    });
  }
});

router.post("/regions-sync-db", async (req, res) => {
  try {
    const API_KEY = process.env.DATA_GO_KR_REGION_API_KEY;
    if (!API_KEY) {
      throw new Error("API key for data.go.kr is not configured on the server.");
    }
    const uddi = "b68902fa-d058-4a17-b188-ff46b7eaaac7";
    const baseUrl = `https://api.odcloud.kr/api/15123287/v1/uddi:${uddi}`;

    const perPage = 10000;
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

      const records = response.data.data;
      const fetchedCount = records.length;

      if (fetchedCount > 0) {
        totalFetched += fetchedCount;
        console.log(`- ${fetchedCount}건의 데이터를 가져왔습니다. (총 ${totalFetched}건)`);

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

      if (fetchedCount < perPage) {
        hasMoreData = false;
        console.log("모든 데이터를 성공적으로 가져왔습니다.");
      } else {
        page++;
      }
    }

    res.status(200).json({
      success: true,
      message: "법정동 데이터 동기화가 완료되었습니다.",
      totalFetched: totalFetched,
    });
  } catch (e) {
    console.error("Error during syncing region data", e);
    if (axios.isAxiosError(e) && e.response) {
      return res.status(e.response.status).json(e.response.data);
    }
    res.status(500).json({
      success: false,
      message: "Error syncing region data",
      error: "Internal Server Error",
    });
  }
});
// #endregion

export default router;
