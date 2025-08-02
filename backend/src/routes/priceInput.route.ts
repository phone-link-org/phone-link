import { Router } from "express";
import { pool } from "../db";
import { PriceInput } from "shared/types";
import { PhoneDevices } from "../dto/phoneDevices";
import { RowDataPacket } from "mysql2/promise"; // Import RowDataPacket

const router = Router();

router.post("/", async (req, res) => {
  const data: PriceInput[] = req.body;
  const db = await pool.getConnection();

  let storages: Map<string, {}> = new Map();
  storages.set("128G", {});
  storages.set("256G", {});
  storages.set("512G", {});
  try {
    for (const v of data) {
      const modelParts = v.model.trim().split(/\s+/);
      let storage: string | null = null;
      let modelName: string = v.model;

      const lastPart = modelParts[modelParts.length - 1];
      if (storages.has(lastPart)) {
        storage = lastPart;
        modelName = modelParts.slice(0, -1).join(" ").trim();
      }
      // 용량이 없거나 유효하지 않은 경우
      if (storage && !storages.has(storage)) {
        console.log(modelName);
        continue;
        // throw new Error(`유효하지 않은 용량: ${storage}`);
      }
      // Explicitly type the query result
      const [deviceRows]: [(RowDataPacket & PhoneDevices)[], any] =
        await db.query(
                `select id
                from phone_models
                where replace(name_ko, ' ', '') like ?
                or replace(name_en, ' ', '') like ?
                limit 1`,
          [`%${modelName}%`, `%${modelName}%`],
        );

      // Check if deviceRows has results
      if (deviceRows.length === 0) {
        console.log(`No device found for model: ${v.model} in phone_models table`);
        continue;
      }

      const deviceId: number = deviceRows[0].id;
      console.log(deviceId);

      // Uncomment and use the insert query as needed
      await db.query(
        `INSERT INTO offers (store_id, carrier_id, device_id, offer_type, price)
         VALUES (?, ?, ?, ?, ?)`,
        [v.storeId, v.carrier, deviceId, v.buyingType, v.typePrice]
      );
    }

    res.status(200).send("Success");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  } finally {
    db.release(); // Release the connection
  }
});

export default router;
