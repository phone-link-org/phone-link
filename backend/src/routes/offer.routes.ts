// server/src/routes/offer.routes.ts
import { Router } from "express";
import { pool } from "../db";
import {
  Region,
  PhoneManufacturer,
  PhoneModel,
  PhoneStorage,
  PhoneDevice,
  RegionCondition,
  ModelCondition,
} from "../../../shared/types";
import { RowDataPacket } from "mysql2";

const router = Router();

router.get("/regions", async (req, res) => {
  const { parentId } = req.query;
  const [rows] = await pool.query<(Region & RowDataPacket)[]>(
    "SELECT region_id, parent_id, name FROM regions WHERE parent_id <=> ? ORDER BY name ASC",
    [parentId === "null" ? null : parentId]
  );
  res.json(rows);
});

router.get("/phone-manufacturers", async (req, res) => {
  const [rows] = await pool.query<PhoneManufacturer & RowDataPacket[]>(
    "SELECT id, name_ko, name_en FROM phone_manufacturers ORDER BY name_ko ASC"
  );
  res.json(rows);
});

router.get("/phone-models", async (req, res) => {
  const { manufacturerId } = req.query;
  const [rows] = await pool.query<PhoneModel & RowDataPacket[]>(
    "SELECT id, manufacturer_id, name_ko, name_en, image_url FROM phone_models WHERE manufacturer_id = ?",
    [manufacturerId === "null" ? null : manufacturerId]
  );
  res.json(rows);
});

router.get("/phone-storages", async (req, res) => {
  const { modelId } = req.query;
  const [rows] = await pool.query<PhoneStorage & RowDataPacket[]>(
    `
     SELECT ps.id, ps.storage FROM phone_storages ps 
       JOIN phone_devices pd ON ps.id = pd.storage_id 
      WHERE model_id = ?
    `,
    [modelId === "null" ? null : modelId]
  );
  res.json(rows);
});

// SELECT
//   o.offer_id,
//   o.store_id,
//   o.carrier_id,
//   o.device_id,
//   o.offer_type,
//   o.price
// FROM offers o
// JOIN stores s ON o.store_id = s.store_id
// JOIN regions r ON s.region_id = r.region_id
// JOIN devices d ON o.device_id = d.device_id
// JOIN device_images di ON d.model_US = di.model_US
// JOIN carriers c ON o.carrier_id = c.carrier_id
// WHERE (r.region_id  IN (134, 3) OR r.parent_id IN (1, 52, 133))
// AND d.brand IN ('Apple', 'Samsung')
// AND d.model_KR IN ('아이폰 16 프로')
// AND d.storage IN ('128GB', '256GB')
// AND offer_type IN ('MNP', 'CHG');

// -- region_id가 음수인 경우 상위 지역 전체를 선택한거임
// -- 서버에서 음수인 애들을 걸러서 양수로 전환해주고, topRegion라고 따로 변수를 빼서 거기에 담아
// -- 그게 위에 1, 52, 133에 들어가야

interface SearchConditions {
  regionConditions: RegionCondition[];
  modelConditions: ModelCondition[];
  carrierConditions: string[];
  offerTypeConditions: string[];
}

router.post("/search", async (req, res) => {
  try {
    const { regions, models } = req.body;

    const regionConds: string[] = [];
    if (regions.allRegion.length > 0) {
      regionConds.push(`r.parent_id IN (${regions.allRegion.join(",")})`);
    }
    if (regions.region.length > 0) {
      regionConds.push(`r.region_id IN (${regions.region.join(",")})`);
    }

    const condRegionSql = regionConds.join(" OR ");

    // ********************** Model 조건 생성 로직 start ********************** //
    let modelWhere = "";
    let modelParams: any[] = [];

    if (models && Array.isArray(models) && models.length > 0) {
      const modelClauses: string[] = [];

      models.forEach((item) => {
        const model = item.model;
        const storage = item.storage;

        if (model.id < 0) {
          // 제조사 전체
          modelClauses.push("pm2.id = ?");
          modelParams.push(model.manufacturer_id);
        } else {
          // 특정 모델
          if (
            !storage ||
            storage.length === 0 ||
            storage.some((s: { id: number }) => s.id < 0)
          ) {
            // 모든 저장용량
            modelClauses.push("pd.model_id = ?");
            modelParams.push(model.id);
          } else {
            // 특정 저장용량
            const storageIds = storage
              .filter((s: { id: number }) => s.id > 0)
              .map((s: { id: any }) => s.id);
            if (storageIds.length > 0) {
              modelClauses.push(
                `(pd.model_id = ? AND pd.storage_id IN (${storageIds
                  .map(() => "?")
                  .join(",")}))`
              );
              modelParams.push(model.id, ...storageIds);
            } else {
              // 모든 저장용량
              modelClauses.push("pd.model_id = ?");
              modelParams.push(model.id);
            }
          }
        }
      });

      if (modelClauses.length > 0) {
        modelWhere = `AND (${modelClauses.join(" OR ")})`;
      }
    }
    // *********************** Model 조건 생성 로직 end *********************** //

    let sql = `
                SELECT 
                    o.offer_id, 
                    s.store_name, 
                    CONCAT_WS(' ', r2.name, r.name) as region_name,
                    c.carrier_name, 
                    CONCAT_WS(' ', pm.name_ko, ps.storage) as model_name,
                    CASE 
                        WHEN o.offer_type = 'MNP' THEN '번호이동'
                        WHEN o.offer_type = 'CHG' THEN '기기변경'
                        ELSE o.offer_type
                    END AS offer_type,
                    o.price,
                    pm.image_url
                FROM offers o
                JOIN stores s ON o.store_id = s.store_id
                JOIN regions r ON s.region_id = r.region_id
                JOIN regions r2 ON r.parent_id = r2.region_id  
                JOIN phone_devices pd ON o.device_id = pd.id
                JOIN phone_models pm ON pd.model_id = pm.id
                JOIN phone_storages ps on pd.storage_id = ps.id
                JOIN phone_manufacturers pm2 ON pm.manufacturer_id = pm2.id
                JOIN carriers c ON o.carrier_id = c.carrier_id
                WHERE 1=1 ${condRegionSql ? "AND " : ""}
                ${condRegionSql}
                ${modelWhere}
            `;

    const [rows] = await pool.query(sql, modelParams);
    res.status(200).json(rows);
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
