import { Router } from "express";
import { Input } from "../types/priceInput";
import { pool } from "../db";

const router = Router();

router.post('/', async (req, res) => {
    const data: Input = req.body;
    // TODO: store_id should be retrieved from authenticated user's session/token

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Find device_id from device_name
        const [deviceRows]: any = await connection.execute('SELECT device_id FROM devices WHERE device_name = ?', [data.devices]);
        if (deviceRows.length === 0) {
            throw new Error(`Device not found: ${data.devices}`);
        }
        const device_id = deviceRows[0].device_id;

        // 2. Insert into offers table
        const offerQuery = 'INSERT INTO offers (store_id, carrier_id, device_id, offer_type, price) VALUES (?, ?, ?, ?, ?)';
        await connection.execute(offerQuery, [data.storeId, data.carrier, device_id, data.buyingType, data.typePrice]);

        // 3. Insert into addons table
        // TODO: The penalty_fee is not in the Input type, so it's hardcoded to 0.
        const addonQuery = 'INSERT INTO addons (store_id, carrier_id, addon_name, monthly_fee, req_duration, penalty_fee) VALUES (?, ?, ?, ?, ?, ?)';
        await connection.execute(addonQuery, [data.storeId, data.carrier, data.addons, data.addonsFee, data.addonsRequiredDuration, 0]);

        await connection.commit();
        res.status(201).json({ message: 'Price input successful' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error processing price input', error: (error as Error).message });
    } finally {
        connection.release();
    }
});

export default router;

