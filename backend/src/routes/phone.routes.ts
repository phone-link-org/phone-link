import { Router } from "express";
import { AppDataSource } from "../db";

import { OfferModelDto, PhoneStorageDto } from "shared/types";

import { PhoneManufacturer } from "../typeorm/phoneManufacturers.entity";
import { PhoneModel } from "../typeorm/phoneModels.entity";
import { PhoneStorage } from "../typeorm/phoneStorage.entity";
import { Carrier } from "../typeorm/carriers.entity";

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
      where: { manufacturer_id: Number(manufacturerId) },
      select: ["manufacturer_id", "id", "name_ko"],
    });

    const resRows: OfferModelDto[] = rows.map((row) => ({
      manufacturerId: row.manufacturer_id,
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
      .select(["ps.id as id", "ps.storage as storage"])
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

export default router;
