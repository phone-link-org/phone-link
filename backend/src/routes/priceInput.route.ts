import { Router } from "express";
import { pool } from "../db";
import { PriceSubmissionData } from "shared/types";
import { PhoneDevices } from "../dto/phoneDevices";
import { RowDataPacket } from "mysql2/promise"; // Import RowDataPacket

const router = Router();

router.post("/excel", async (req, res) => {
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
      await db.beginTransaction()
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

router.post("/manual", async (req, res) => {
  const { priceInputs, addons }: PriceSubmissionData = req.body;
  const db = await pool.getConnection();

  try {
    await db.beginTransaction();

    // 1. Insert addons and get their IDs
    const addonIds = [];
    for (const addon of addons) {
      if (!addon.name) continue; // Skip empty addons
      const [result] = await db.query(
        `INSERT INTO addons (name, fee, required_duration) VALUES (?, ?, ?)`,
        [addon.name, addon.fee, addon.requiredDuration]
      );
      addonIds.push((result as any).insertId);
    }

    // 2. Insert priceInputs and link to addons
    for (const priceInput of priceInputs) {
      // Find device_id based on model name and capacity
      const [deviceRows]: [(RowDataPacket & PhoneDevices)[], any] = await db.query(
        `SELECT pd.id
         FROM phone_devices pd
         JOIN phone_models pm ON pd.model_id = pm.id
         JOIN phone_storages ps ON pd.storage_id = ps.id
         WHERE (REPLACE(pm.name_ko, ' ', '') LIKE ? OR REPLACE(pm.name_en, ' ', '') LIKE ?)
           AND ps.storage = ?
         LIMIT 1`,
        [`%${priceInput.model.replace(/\s/g, '')}%`, `%${priceInput.model.replace(/\s/g, '')}%`, priceInput.capacity]
      );

      if (deviceRows.length === 0) {
        // If no device is found, you might want to throw an error or log it
        console.warn(`Device not found for model: ${priceInput.model} with capacity: ${priceInput.capacity}`);
        continue; // Skip this priceInput
      }
      const deviceId = deviceRows[0].id;

      // Insert the offer
      const [offerResult] = await db.query(
        `INSERT INTO offers (store_id, carrier_id, device_id, offer_type, price) VALUES (?, ?, ?, ?, ?)`,
        // Assuming storeId is 1 for now, you might need to get it from the request or session
        [1, priceInput.carrier, deviceId, priceInput.buyingType, priceInput.typePrice]
      );
      const offerId = (offerResult as any).insertId;

      // Link addons to the offer
      for (const addonId of addonIds) {
        await db.query(
          `INSERT INTO offer_addons (offer_id, addon_id) VALUES (?, ?)`,
          [offerId, addonId]
        );
      }
    }

    await db.commit();
    res.status(200).json({ message: "Data successfully saved." });

  } catch (error) {
    await db.rollback();
    console.error("Error during manual data insertion:", error);
    res.status(500).json({ message: "Failed to save data." });
  } finally {
    db.release();
  }
});

export default router;
