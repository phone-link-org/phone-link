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

router.post("/search", async (req, res) => {
  try {
    // page: 현재 페이지 번호, limit: 페이지 당 아이템 수, sortOrder: 정렬 순서
    const {
      regions,
      models,
      carriers,
      offerTypes,
      page = 1,
      limit = 20,
      sortOrder = "default",
    } = req.body;

    // 지역 조건
    const regionClauses: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelParams: any = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasNegativeStorage = storages.some((s: any) => Number(s?.id) < 0);
        const positiveStorageIds = storages
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let carrierParams: any = {};
    if (carriers?.length) {
      const carrierIds = carriers
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any) => Number(c.carrier_id))
        .filter((v: number) => Number.isFinite(v));
      if (carrierIds.length) {
        carrierClause = `c.carrier_id IN (:...carrierIds)`;
        carrierParams = { carrierIds };
      }
    }

    // 번호이동/기기변경 조건
    let offerTypeClause = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // 정렬 조건 적용
    if (sortOrder === "price_asc") {
      qb.orderBy("o.price", "ASC");
    } else if (sortOrder === "price_desc") {
      qb.orderBy("o.price", "DESC");
    }

    // 페이지네이션을 위한 총 개수 카운트 (주석처리됨, 필요시 활성화)
    // const total = await qb.getCount();

    // 페이지네이션 적용
    // limit + 1개를 가져와서 다음 페이지가 있는지 확인
    const items = await qb
      .offset((page - 1) * limit)
      .limit(limit + 1)
      .getRawMany();

    // 다음 페이지 존재 여부 확인
    const hasNextPage = items.length > limit;
    // 실제 반환할 아이템은 limit 개수만큼 슬라이스
    const paginatedItems = items.slice(0, limit);

    res.status(200).json({
      offers: paginatedItems,
      hasNextPage,
    });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
