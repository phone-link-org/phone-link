// server/src/routes/offer.routes.ts
import { Router } from "express";
import { AppDataSource } from "../db";
import { Region } from "../typeorm/regions.entity";
import { Carrier } from "../typeorm/carriers.entity";
import { PhoneManufacturer } from "../typeorm/phoneManufacturers.entity";
import { PhoneModel } from "../typeorm/phoneModels.entity";
import { PhoneStorage } from "../typeorm/phoneStorage.entity";
import { Offer } from "../typeorm/offers.entity";
import { OfferRegionDto, OfferSearchResult } from "shared/types";

const router = Router();

router.get("/regions", async (req, res) => {
  try {
    const { sidoCode = null } = req.query;

    const regionRepo = AppDataSource.getRepository(Region);
    const qb = regionRepo.createQueryBuilder("regions");

    qb.where("regions.is_active = :isActive", { isActive: true }); // 폐지되지 않은, 현존하는 지역만 조회

    const selectFields = [
      "regions.code as code",
      "regions.is_active as is_active",
      "regions.latitude as latitude",
      "regions.longitude as longitude",
      "regions.last_synced_at as last_synced_at",
      "regions.created_at as created_at",
      "regions.updated_at as updated_at",
    ];

    if (sidoCode === null) {
      // 최상위 지역 (시/도) 조회: 이름에 공백이 없는 지역
      const nameCaseExpression = `CASE 
          WHEN regions.name IN ('충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도') 
          THEN CONCAT(SUBSTRING(regions.name, 1, 1), SUBSTRING(regions.name, 3, 1)) 
          ELSE SUBSTRING(regions.name, 1, 2) 
        END`;

      qb.select([...selectFields, `${nameCaseExpression} as name`]);
      qb.andWhere(
        "(CHAR_LENGTH(regions.name) - CHAR_LENGTH(REPLACE(regions.name, ' ', ''))) = 0",
      );
    } else {
      // 시/군/구 조회: 이름에 공백이 1개 있고, 코드가 sidoCode로 시작하는 지역
      qb.select([
        ...selectFields,
        "SUBSTRING_INDEX(regions.name, ' ', -1) as name",
      ]);
      qb.andWhere(
        "(CHAR_LENGTH(regions.name) - CHAR_LENGTH(REPLACE(regions.name, ' ', ''))) = 1",
      ).andWhere("regions.code LIKE :sidoCode", {
        sidoCode: `${sidoCode}%`,
      });
    }

    const rows = await qb.getRawMany();

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

    if (regions?.length) {
      const sidoCodeClauses: string[] = [];
      const specificCodes: string[] = [];

      regions.forEach((region: OfferRegionDto, index: number) => {
        // code 값의 맨 앞에 '-'이 있으면 시/도 단위 필터링
        if (region.code.startsWith("-")) {
          // 2,3번째 자리의 코드 추출 (예: '-1100000000' -> '11')
          const temp = region.code.substring(1, 3);
          console.log(temp);
          const sidoCode = region.code.substring(1, temp === "36" ? 5 : 3);
          sidoCodeClauses.push(`r.code LIKE :parentCode${index}`);
          regionParams[`parentCode${index}`] = `${sidoCode}%`;
        } else {
          // 일반 지역 코드는 IN 조건에 추가
          specificCodes.push(region.code);
        }
      });

      // 시/도 단위 조건 추가
      if (sidoCodeClauses.length > 0) {
        regionClauses.push(`(${sidoCodeClauses.join(" OR ")})`);
      }

      // 특정 지역 코드 조건 추가
      if (specificCodes.length > 0) {
        regionClauses.push(`r.code IN (:...codes)`);
        regionParams.codes = specificCodes;
      }
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
        .map((c: any) => Number(c.id))
        .filter((v: number) => Number.isFinite(v));
      if (carrierIds.length) {
        carrierClause = `c.id IN (:...carrierIds)`;
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
        "o.id AS id",
        "s.name AS store_name",
        "r.name as region_name",
        "c.name AS carrier_name",
        "CONCAT_WS(' ', pm.name_ko, ps.storage) as model_name",
        "CASE WHEN o.offer_type = 'MNP' THEN '번호이동' WHEN o.offer_type = 'CHG' THEN '기기변경' ELSE o.offer_type END AS offer_type",
        "o.price AS price",
        "pm.image_url AS image_url",
      ])
      .innerJoin("o.store", "s")
      .innerJoin("s.region", "r")
      .innerJoin("o.device", "pd")
      .innerJoin("pd.model", "pm")
      .innerJoin("pd.storage", "ps")
      .innerJoin("pm.manufacturer", "pm2")
      .innerJoin("o.carrier", "c")
      .where("1=1")
      .andWhere("r.is_active = :isActive", { isActive: true }) // 폐지되지 않은, 현존하는 지역만 조회
      .andWhere(
        "(CHAR_LENGTH(r.name) - CHAR_LENGTH(REPLACE(r.name, ' ', ''))) = 1",
      ) // '시/군/구' 코드만 불러오는 조건
      .andWhere("s.status = :status", { status: "OPEN" }) // 폐업하지 않은 매장만 조회
      .andWhere("s.approval_status = :approvalStatus", {
        approvalStatus: "APPROVED",
      }); // 승인된 매장만 조회

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
    const items: OfferSearchResult[] = await qb
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
