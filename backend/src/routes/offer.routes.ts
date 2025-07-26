// server/src/routes/offer.routes.ts
import { Router } from 'express';
import { pool } from '../db';
import { Region, SubRegion } from '../../../shared/types';
import { RowDataPacket } from 'mysql2';

const router = Router();

router.get('/regions', async (req, res) => {
    const [rows] = await pool.query<(Region & RowDataPacket)[]>(
        'SELECT region_id, name FROM regions ORDER BY name ASC'
      );
  res.json(rows);
});

router.get('/sub-regions', async (req, res) => {
  const regionId = req.query.regionId;
  if (!regionId) return res.status(400).json({ error: 'Missing regionId' });

  const [rows] = await pool.query<(SubRegion & RowDataPacket)[]>(
    'SELECT sub_region_id, name FROM sub_regions WHERE region_id = ? ORDER BY name ASC',
    [regionId]
  );

  const allSubRegion = { sub_region_id: 0, name: "전체" };

  res.json([allSubRegion, ...rows]);
});

export default router;
