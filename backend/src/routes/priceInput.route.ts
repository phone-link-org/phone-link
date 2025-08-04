import { Router } from "express";
import { pool } from "../db";
import { PriceSubmissionData } from "shared/types";
import { PhoneDevices } from "../dto/phoneDevices";
import { RowDataPacket } from "mysql2/promise";

const router = Router();

router.post("/", async (req, res) => {
  const { priceInputs, addons }: PriceSubmissionData = req.body;
  const db = await pool.getConnection();

  try {
    await db.beginTransaction();

    const addonIds = [];
    if (addons && addons.length > 0) {
      for (const addon of addons) {
        if (!addon.name || !addon.fee || !addon.requiredDuration) continue;
        const [result] = await db.query(
          `INSERT INTO addons (store_id, carrier_id, addon_name, monthly_fee, req_duration, penalty_fee) VALUES (?, ?, ?)`,
          [priceInputs.storeId , addon.fee, addon.requiredDuration]
        );
        addonIds.push((result as any).insertId);
      }
    }

    for (const priceInput of priceInputs) {
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
        console.warn(`Device not found for model: ${priceInput.model} with capacity: ${priceInput.capacity}`);
        continue;
      }
      const deviceId = deviceRows[0].id;

      const [offerResult] = await db.query(
        `INSERT INTO offers (store_id, carrier_id, device_id, offer_type, price) VALUES (?, ?, ?, ?, ?)`,
        [1, priceInput.carrier, deviceId, priceInput.buyingType, priceInput.typePrice]
      );
      const offerId = (offerResult as any).insertId;

      for (const addonId of addonIds) {
        await db.query(
          `INSERT INTO offer_addons (offer_id, addon_id) VALUES (?, ?)`,
          [offerId, addonId]
        );
      }
    }

    await db.commit();
    res.status(201).json({ message: "Data successfully saved." });

  } catch (error) {
    await db.rollback();
    console.error("Error during data insertion:", error);
    res.status(500).json({ message: "Failed to save data." });
  } finally {
    db.release();
  }
});

export default router;
