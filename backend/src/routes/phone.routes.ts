import { Router } from "express";
import { AppDataSource } from "../db";

import { OfferModelDto, PhoneStorageDto } from "shared/types";

import { PhoneManufacturer } from "../typeorm/phoneManufacturers.entity";
import { PhoneModel } from "../typeorm/phoneModels.entity";
import { PhoneStorage } from "../typeorm/phoneStorage.entity";
import { Carrier } from "../typeorm/carriers.entity";
import { PhoneDevice } from "../typeorm/phoneDevices.entity";

const router = Router();

// 제조사 조회
router.get("/manufacturers", async (req, res) => {
  try {
    const manufacturerRepo = AppDataSource.getRepository(PhoneManufacturer);
    const rows = await manufacturerRepo.find();

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "제조사 정보를 불러오는 중 오류가 발생했습니다.",
    });
  }
});

router.get("/models", async (req, res) => {
  try {
    const { manufacturerId } = req.query;
    const modelRepo = AppDataSource.getRepository(PhoneModel);
    const rows = await modelRepo.find({
      where: { manufacturerId: Number(manufacturerId) },
      select: ["manufacturerId", "id", "name_ko"],
    });

    const resRows: OfferModelDto[] = rows.map((row) => ({
      manufacturerId: row.manufacturerId,
      modelId: Number(row.id),
      name: row.name_ko,
    }));

    res.status(200).json({
      success: true,
      data: resRows,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "모델 정보를 불러오는 중 오류가 발생했습니다.",
    });
  }
});

router.get("/storages", async (req, res) => {
  try {
    const { modelId } = req.query;
    const phoneStorageRepo = AppDataSource.getRepository(PhoneStorage);

    const storages = await phoneStorageRepo
      .createQueryBuilder("ps")
      .select(["ps.id AS id", "ps.storage AS storage"])
      .where("pd.model_id = :modelId", {
        modelId: modelId === "null" ? null : Number(modelId),
      })
      .innerJoin("ps.devices", "pd")
      .getRawMany<PhoneStorageDto[]>();

    res.status(200).json({
      success: true,
      data: storages,
    });
  } catch (error) {
    console.error("Error fetching storages:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "저장소 정보를 불러오는 중 오류가 발생했습니다.",
    });
  }
});

router.get("/allStorages", async (req, res) => {
  try {
    const phoneStorageRepo = AppDataSource.getRepository(PhoneStorage);
    const storages = await phoneStorageRepo.find({ order: { id: "ASC" } });

    res.status(200).json({
      success: true,
      data: storages,
    });
  } catch (error) {
    console.error("Error fetching storages:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "핸드폰 용량 정보를 불러오는 중 오류가 발생했습니다.",
    });
  }
});

router.get("/carriers", async (req, res) => {
  try {
    const carrierRepo = AppDataSource.getRepository(Carrier);
    const rows = await carrierRepo.find();
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching carriers:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "통신사 정보를 불러오는 중 오류가 발생했습니다.",
    });
  }
});

// 제조사, 모델, 기기를 계층 구조로 반환하는 엔드포인트
router.get("/devices-structured", async (_, res) => {
  try {
    const deviceRepo = AppDataSource.getRepository(PhoneDevice);

    // 1. getRawMany()를 사용해 필요한 모든 데이터를 평평한 구조로 조회
    const flatData = await deviceRepo
      .createQueryBuilder("device")
      .select([
        "m.id as manufacturerId",
        "m.name_ko as manufacturerName",
        "model.id as modelId",
        "model.name_ko as modelName",
        "storage.id as storageId",
        "storage.storage as capacity",
      ])
      .innerJoin("device.model", "model")
      .innerJoin("model.manufacturer", "m")
      .innerJoin("device.storage", "storage")
      .orderBy("m.id", "ASC")
      .addOrderBy("model.releaseDate", "DESC")
      .addOrderBy("model.name_ko", "ASC")
      .addOrderBy(
        `CASE
            WHEN storage.storage LIKE '%TB' THEN CAST(REPLACE(storage.storage, 'TB', '') AS UNSIGNED) * 1024
            WHEN storage.storage LIKE '%GB' THEN CAST(REPLACE(storage.storage, 'GB', '') AS UNSIGNED)
            ELSE 0
         END`,
        "ASC",
      )
      .getRawMany();

    // 2. 평평한 데이터를 계층적 구조로 재조립
    const manufacturersMap = new Map();

    for (const item of flatData) {
      // 제조사 레벨
      if (!manufacturersMap.has(item.manufacturerId)) {
        manufacturersMap.set(item.manufacturerId, {
          id: item.manufacturerId,
          name: item.manufacturerName,
          models: new Map(),
        });
      }
      const manufacturer = manufacturersMap.get(item.manufacturerId);

      // 모델 레벨
      if (!manufacturer.models.has(item.modelId)) {
        manufacturer.models.set(item.modelId, {
          id: item.modelId,
          name: item.modelName,
          storages: [],
        });
      }
      const model = manufacturer.models.get(item.modelId);

      // 용량 레벨
      model.storages.push({
        id: item.storageId,
        capacity: item.capacity,
      });
    }

    // Map을 최종 배열 형태로 변환
    const structuredData = Array.from(manufacturersMap.values()).map((m) => ({
      ...m,
      models: Array.from(m.models.values()),
    }));

    res.status(200).json({
      success: true,
      data: structuredData,
    });
  } catch (error) {
    console.error("Error fetching structured devices", error);
    res.status(500).json({
      success: false,
      message: "기기 정보 조회 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

export default router;
