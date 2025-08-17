// server/src/routes/offer.routes.ts
import { Router } from "express";
import { AppDataSource } from "../db";
import { IsNull } from "typeorm";
import { Region } from "../typeorm/regions.entity";
import { Carrier } from "../typeorm/carriers.entity";
import { PhoneManufacturer } from "../typeorm/phoneManufacturers.entity";
import { PhoneModel } from "../typeorm/phoneModels.entity";
import { PhoneStorage } from "../typeorm/phoneStorage.entity";
import { Offer } from "../typeorm/offers.entity";

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
    .innerJoin("ps.devices", "pd")
    .where("pd.model_id = :modelId", {
      modelId: modelId === "null" ? null : Number(modelId),
    })
    .select(["ps.id", "ps.storage"])
    .getMany();

  res.json(storages);
});

// router.post("/search", async (req, res) => {
//   try {
//     const { regions, models, carriers, offerTypes } = req.body;

//     // 지역 조건
//     // const regionConds: string[] = [];
//     // if (regions.allRegion.length > 0) {
//     //   regionConds.push(`r.parent_id IN (${regions.allRegion.join(",")})`);
//     // }
//     // if (regions.region.length > 0) {
//     //   regionConds.push(`r.region_id IN (${regions.region.join(",")})`);
//     // }

//     // 지역 조건
//     let regionClauses: string[] = [];
//     let regionParams: any = {};

//     if (regions.allRegion?.length) {
//       regionClauses.push(`r.parent_id IN (:...allRegionIds)`);
//       regionParams.allRegionIds = regions.allRegion;
//     }
//     if (regions.region?.length) {
//       regionClauses.push(`r.region_id IN (:...regionIds)`);
//       regionParams.regionIds = regions.region;
//     }

//     // 모델 조건
//     let modelWhere = "";
//     let modelParams: any[] = [];
//     if (models && Array.isArray(models) && models.length > 0) {
//       const modelClauses: string[] = [];
//       models.forEach((item) => {
//         const model = item.model;
//         const storage = item.storage;
//         if ("manufacturerId" in model) {
//           modelClauses.push("pm2.id = :manufacturerId");
//           modelParams.push({ manufacturerId: model.manufacturer_id });
//         } else {
//           if (
//             !storage ||
//             storage.length === 0 ||
//             storage.some((s: { id: number }) => s.id < 0)
//           ) {
//             modelClauses.push("pd.model_id = :modelId");
//             modelParams.push({ modelId: model.id });
//           } else {
//             const storageIds = storage
//               .filter((s: { id: number }) => s.id > 0)
//               .map((s: { id: any }) => s.id);
//             if (storageIds.length > 0) {
//               modelClauses.push(
//                 `(pd.model_id = :modelId AND pd.storage_id IN (:...storageIds))`
//               );
//               modelParams.push({ modelId: model.id, storageIds });
//             } else {
//               modelClauses.push("pd.model_id = :modelId");
//               modelParams.push({ modelId: model.id });
//             }
//           }
//         }
//       });
//       if (modelClauses.length > 0) {
//         modelWhere = `(${modelClauses.join(" OR ")})`;
//       }
//     }

//     console.log(modelWhere);
//     console.log(modelParams);

//     // 통신사 조건
//     let carriersConditionSql = "";
//     let carrierParams: any = {};
//     if (carriers && carriers.length > 0) {
//       const carrierIds = carriers.map((c: Carrier) => c.carrier_id);
//       carriersConditionSql = `c.carrier_id IN (:...carrierIds)`;
//       carrierParams = { carrierIds };
//     }

//     // 번호이동 or 기기변경 조건
//     let offerTypesConditionSql = "";
//     let offerTtypeParams: any = {};
//     if (offerTypes && offerTypes.length > 0) {
//       offerTypesConditionSql = `o.offer_type IN (:...offerTypes)`;
//       offerTtypeParams = { offerTypes };
//     }

//     // TypeORM QueryBuilder
//     const qb = AppDataSource.getRepository(Offer)
//       .createQueryBuilder("o")
//       .select([
//         "o.offer_id AS offer_id",
//         "s.store_name AS store_name",
//         "CONCAT_WS(' ', r2.name, r.name) as region_name",
//         "c.carrier_name AS carrier_name",
//         "CONCAT_WS(' ', pm.name_ko, ps.storage) as model_name",
//         "CASE WHEN o.offer_type = 'MNP' THEN '번호이동' WHEN o.offer_type = 'CHG' THEN '기기변경' ELSE o.offer_type END AS offer_type",
//         "o.price AS price",
//         "pm.image_url AS image_url",
//       ])
//       .innerJoin("o.store", "s")
//       .innerJoin("s.region", "r")
//       .innerJoin(Region, "r2", "r.parent_id = r2.region_id")
//       .innerJoin("o.device", "pd")
//       .innerJoin("pd.model", "pm")
//       .innerJoin("pd.storage", "ps")
//       .innerJoin("pm.manufacturer", "pm2")
//       .innerJoin("o.carrier", "c")
//       .where("1=1");

//     if (regionClauses.length > 0) {
//       qb.andWhere(`(${regionClauses.join(" OR ")})`, regionParams);
//     }

//     if (modelWhere) {
//       // modelParams는 여러 개의 객체 배열이므로, 각 파라미터를 병합
//       modelParams.forEach((param) => qb.andWhere(modelWhere, param));
//     }
//     if (carriersConditionSql) {
//       qb.andWhere(carriersConditionSql, carrierParams);
//     }
//     if (offerTypesConditionSql) {
//       qb.andWhere(offerTypesConditionSql, offerTtypeParams);
//     }

//     const rows = await qb.getRawMany();
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error("DB Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
//});

// router.post("/search", async (req, res) => {
//   try {
//     const { regions, models, carriers, offerTypes } = req.body;

//     // =====================
//     // 지역 조건
//     // =====================
//     const regionClauses: string[] = [];
//     const regionParams: any = {};

//     if (regions?.allRegion?.length) {
//       regionClauses.push(`r.parent_id IN (:...allRegionIds)`);
//       regionParams.allRegionIds = regions.allRegion;
//     }
//     if (regions?.region?.length) {
//       regionClauses.push(`r.region_id IN (:...regionIds)`);
//       regionParams.regionIds = regions.region;
//     }

//     // =====================
//     // 모델 조건
//     // =====================
//     const modelClauses: string[] = [];
//     const modelParams: any = {};
//     //console.log(JSON.stringify(models, null, 2));
//     (models || []).forEach((item: ModelCondition, idx: any) => {
//       const clauseParts: string[] = [];
//       const prefix = `m${idx}`; // 파라미터 이름 충돌 방지

//       const model = item.model;
//       const storage = item.storage || [];

//       // 제조사 조건
//       if (model.manufacturer_id) {
//         clauseParts.push(`pm2.id = :${prefix}_manu`);
//         modelParams[`${prefix}_manu`] = model.manufacturer_id;
//       }
//       // 모델 조건
//       else if (model.id) {
//         clauseParts.push(`pd.model_id = :${prefix}_model`);
//         modelParams[`${prefix}_model`] = model.id;

//         // 저장 용량 조건
//         const storageIds = storage
//           .filter((s: { id: number }) => s.id > 0)
//           .map((s: { id: number }) => s.id);
//         if (storageIds.length > 0) {
//           clauseParts.push(`pd.storage_id IN (:...${prefix}_storages)`);
//           modelParams[`${prefix}_storages`] = storageIds;
//         }
//       }

//       if (clauseParts.length > 0) {
//         modelClauses.push(`(${clauseParts.join(" AND ")})`);
//       }
//     });

//     // =====================
//     // 통신사 조건
//     // =====================
//     let carrierClause = "";
//     let carrierParams: any = {};
//     if (carriers?.length) {
//       const carrierIds = carriers.map((c: any) => c.carrier_id);
//       carrierClause = `c.carrier_id IN (:...carrierIds)`;
//       carrierParams = { carrierIds };
//     }

//     // =====================
//     // 번호이동/기기변경 조건
//     // =====================
//     let offerTypeClause = "";
//     let offerTypeParams: any = {};
//     if (offerTypes?.length) {
//       offerTypeClause = `o.offer_type IN (:...offerTypes)`;
//       offerTypeParams = { offerTypes };
//     }

//     // =====================
//     // QueryBuilder
//     // =====================
//     const qb = AppDataSource.getRepository(Offer)
//       .createQueryBuilder("o")
//       .select([
//         "o.offer_id AS offer_id",
//         "s.store_name AS store_name",
//         "CONCAT_WS(' ', r2.name, r.name) as region_name",
//         "c.carrier_name AS carrier_name",
//         "CONCAT_WS(' ', pm.name_ko, ps.storage) as model_name",
//         "CASE WHEN o.offer_type = 'MNP' THEN '번호이동' WHEN o.offer_type = 'CHG' THEN '기기변경' ELSE o.offer_type END AS offer_type",
//         "o.price AS price",
//         "pm.image_url AS image_url",
//       ])
//       .innerJoin("o.store", "s")
//       .innerJoin("s.region", "r")
//       .innerJoin(Region, "r2", "r.parent_id = r2.region_id")
//       .innerJoin("o.device", "pd")
//       .innerJoin("pd.model", "pm")
//       .innerJoin("pd.storage", "ps")
//       .innerJoin("pm.manufacturer", "pm2")
//       .innerJoin("o.carrier", "c")
//       .where("1=1");

//     // 조건 동적 적용
//     if (regionClauses.length)
//       qb.andWhere(`(${regionClauses.join(" OR ")})`, regionParams);
//     if (modelClauses.length)
//       qb.andWhere(`(${modelClauses.join(" OR ")})`, modelParams);
//     if (carrierClause) qb.andWhere(carrierClause, carrierParams);
//     if (offerTypeClause) qb.andWhere(offerTypeClause, offerTypeParams);

//     const rows = await qb.getRawMany();
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error("DB Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.post("/search", async (req, res) => {
  try {
    const { regions, models, carriers, offerTypes } = req.body;

    // 지역 조건
    const regionClauses: string[] = [];
    const regionParams: any = {};

    if (regions?.allRegion?.length) {
      regionClauses.push(`r.parent_id IN (:...allRegionIds)`);
      regionParams.allRegionIds = regions.allRegion.map(Number);
    }
    if (regions?.region?.length) {
      regionClauses.push(`r.region_id IN (:...regionIds)`);
      regionParams.regionIds = regions.region.map(Number);
    }

    // 모델 조건
    const modelClauses: string[] = [];
    const modelParams: any = {};

    (models || []).forEach((item: any, idx: number) => {
      const prefix = `m${idx}`;

      const rawModelId = item?.model?.id;
      const rawManuId = item?.model?.manufacturer_id;
      const modelId = Number(rawModelId);
      const manuId = Number(rawManuId);

      // model.id < 0  => 제조사 단위 필터
      if (Number.isFinite(modelId) && modelId < 0) {
        if (Number.isFinite(manuId) && manuId > 0) {
          modelClauses.push(`(pm2.id = :${prefix}_manu)`);
          modelParams[`${prefix}_manu`] = manuId;
        }
        return; // 이 항목 처리 끝
      }

      // model.id > 0  => 모델 단위 + 스토리지 규칙
      if (Number.isFinite(modelId) && modelId > 0) {
        const storages = Array.isArray(item?.storage) ? item.storage : [];
        const hasNegativeStorage = storages.some((s: any) => Number(s?.id) < 0);
        const positiveStorageIds = storages
          .map((s: any) => Number(s?.id))
          .filter((id: number) => Number.isFinite(id) && id > 0);

        if (!hasNegativeStorage && positiveStorageIds.length > 0) {
          // 스토리지 조건 적용
          modelClauses.push(
            `(pd.model_id = :${prefix}_model AND pd.storage_id IN (:...${prefix}_storages))`,
          );
          modelParams[`${prefix}_model`] = modelId;
          modelParams[`${prefix}_storages`] = positiveStorageIds;
        } else {
          // 스토리지 조건 생략
          modelClauses.push(`(pd.model_id = :${prefix}_model)`);
          modelParams[`${prefix}_model`] = modelId;
        }
      }
      // 그 외(0, NaN 등)는 무시
    });

    // 통신사 조건
    let carrierClause = "";
    let carrierParams: any = {};
    if (carriers?.length) {
      const carrierIds = carriers
        .map((c: any) => Number(c.carrier_id))
        .filter((v: number) => Number.isFinite(v));
      if (carrierIds.length) {
        carrierClause = `c.carrier_id IN (:...carrierIds)`;
        carrierParams = { carrierIds };
      }
    }

    // 번호이동/기기변경 조건
    let offerTypeClause = "";
    let offerTypeParams: any = {};
    if (offerTypes?.length) {
      offerTypeClause = `o.offer_type IN (:...offerTypes)`;
      offerTypeParams = { offerTypes };
    }

    // QueryBuilder
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

    if (regionClauses.length) {
      qb.andWhere(`(${regionClauses.join(" OR ")})`, regionParams);
    }
    if (modelClauses.length) {
      qb.andWhere(`(${modelClauses.join(" OR ")})`, modelParams);
    }
    if (carrierClause) {
      qb.andWhere(carrierClause, carrierParams);
    }
    if (offerTypeClause) {
      qb.andWhere(offerTypeClause, offerTypeParams);
    }

    // 디버그가 필요하면 아래 두 줄 주석 해제
    // const [sql, params] = qb.getQueryAndParameters();
    // console.log(sql, params);

    const rows = await qb.getRawMany();
    res.status(200).json(rows);
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
