// server/src/routes/offer.routes.ts
import { Router } from "express";
import { AppDataSource } from "../db";
import { IsNull } from "typeorm";
import { Region } from "../typeorm/regions.entity";
import { Carrier } from "../typeorm/carriers.entity";
import { PhoneManufacturer } from "../typeorm/phoneManufacturers.entity";
import { PhoneModel } from "../typeorm/phoneModels.entity";
import { PhoneStorage } from "../typeorm/phoneStorage.entity";
import { PhoneDevice } from "../typeorm/phoneDevices.entity";
import { Offer } from "../typeorm/offers.entity";
import { RegionCondition, ModelCondition } from "../../../shared/types";

const router = Router();

router.post("/regions", async (req, res) => {
  try {
    const { parentId } = req.body;

    const regionRepo = AppDataSource.getRepository(Region);

    const rows = await regionRepo.find({
      where:
        parentId === null ? { parent_id: IsNull() } : { parent_id: parentId },
      order: { name: "ASC" },
    });
    res.json(rows);
  } catch (err) {
    console.error("Error fetching regions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/carriers", async (req, res) => {
  const CarrierRepo = AppDataSource.getRepository(Carrier);
  const rows = await CarrierRepo.find();
  res.json(rows);
});

router.get("/phone-manufacturers", async (req, res) => {
  const PhoneManufacturerRepo = AppDataSource.getRepository(PhoneManufacturer);
  const rows = await PhoneManufacturerRepo.find();
  res.json(rows);
});

router.post("/phone-models", async (req, res) => {
  const { manufacturerId } = req.body;
  const PhoneModelRepo = AppDataSource.getRepository(PhoneModel);
  const rows = await PhoneModelRepo.find({
    where: {
      manufacturer_id: manufacturerId,
    },
  });
  res.json(rows);
});

router.get("/phone-storages", async (req, res) => {
  const { modelId } = req.query;
  const phoneStorageRepo = AppDataSource.getRepository(PhoneStorage);

  const storages = await phoneStorageRepo
    .createQueryBuilder("ps")
    .innerJoin("ps.devices", "pd") // PhoneStorage 엔티티에 PhoneDevice relation 있어야 함
    .where("pd.model_id = :modelId", {
      modelId: modelId === "null" ? null : Number(modelId),
    })
    .select(["ps.id", "ps.storage"])
    .getMany();

  res.json(storages);
});

router.post("/search", async (req, res) => {
  try {
    const { regions, models, carriers, offerTypes } = req.body;

    // 지역 조건
    const regionConds: string[] = [];
    if (regions.allRegion.length > 0) {
      regionConds.push(`r.parent_id IN (${regions.allRegion.join(",")})`);
    }
    if (regions.region.length > 0) {
      regionConds.push(`r.region_id IN (${regions.region.join(",")})`);
    }
    const condRegionSql = regionConds.join(" OR ");

    // 모델 조건
    let modelWhere = "";
    let modelParams: any[] = [];
    if (models && Array.isArray(models) && models.length > 0) {
      const modelClauses: string[] = [];
      models.forEach((item) => {
        const model = item.model;
        const storage = item.storage;
        if (model.id < 0) {
          modelClauses.push("pm2.id = :manufacturerId");
          modelParams.push({ manufacturerId: model.manufacturer_id });
        } else {
          if (
            !storage ||
            storage.length === 0 ||
            storage.some((s: { id: number }) => s.id < 0)
          ) {
            modelClauses.push("pd.model_id = :modelId");
            modelParams.push({ modelId: model.id });
          } else {
            const storageIds = storage
              .filter((s: { id: number }) => s.id > 0)
              .map((s: { id: any }) => s.id);
            if (storageIds.length > 0) {
              modelClauses.push(
                `(pd.model_id = :modelId AND pd.storage_id IN (:...storageIds))`
              );
              modelParams.push({ modelId: model.id, storageIds });
            } else {
              modelClauses.push("pd.model_id = :modelId");
              modelParams.push({ modelId: model.id });
            }
          }
        }
      });
      if (modelClauses.length > 0) {
        modelWhere = `(${modelClauses.join(" OR ")})`;
      }
    }

    console.log(modelWhere);
    console.log(modelParams);

    // 통신사 조건
    let carriersConditionSql = "";
    let carrierParams: any = {};
    if (carriers && carriers.length > 0) {
      const carrierIds = carriers.map((c: Carrier) => c.carrier_id);
      carriersConditionSql = `c.carrier_id IN (:...carrierIds)`;
      carrierParams = { carrierIds };
    }

    console.log(carriersConditionSql);
    console.log(carrierParams);

    // 번호이동 or 기기변경 조건
    let offerTypesConditionSql = "";
    let offerTtypeParams: any = {};
    if (offerTypes && offerTypes.length > 0) {
      carriersConditionSql = `o.offer_type IN (:...offerTypes)`;
      carrierParams = { offerTypes };
    }

    console.log(offerTypesConditionSql);
    console.log(offerTtypeParams);

    // TypeORM QueryBuilder
    const qb = AppDataSource.getRepository(Offer)
      .createQueryBuilder("o")
      .select([
        "o.offer_id AS offer_id",
        "s.store_name AS store_name",
        "CONCAT_WS(' ', r2.name, r.name) as region_name",
        "c.carrier_name AS carrier_name",
        "CONCAT_WS(' ', pm.name_ko, ps.storage) as model_name",
        "CASE WHEN o.offer_type = 'MNP' THEN '번호이동' WHEN o.offer_type = 'CHG' THEN '기기변경' ELSE o.offer_type END AS offer_type",
        "o.price AS price",
        "pm.image_url AS image_url",
      ])
      .innerJoin("o.store", "s")
      .innerJoin("s.region", "r")
      .innerJoin(Region, "r2", "r.parent_id = r2.region_id")
      .innerJoin("o.device", "pd")
      .innerJoin("pd.model", "pm")
      .innerJoin("pd.storage", "ps")
      .innerJoin("pm.manufacturer", "pm2")
      .innerJoin("o.carrier", "c")
      .where("1=1");

    if (condRegionSql) {
      qb.andWhere(`(${condRegionSql})`);
    }
    if (modelWhere) {
      // modelParams는 여러 개의 객체 배열이므로, 각 파라미터를 병합
      modelParams.forEach((param) => qb.andWhere(modelWhere, param));
    }
    if (carriersConditionSql) {
      qb.andWhere(carriersConditionSql, carrierParams);
    }
    if (offerTypesConditionSql) {
      qb.andWhere(offerTypesConditionSql, offerTtypeParams);
    }

    const rows = await qb.getRawMany();
    res.status(200).json(rows);
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
