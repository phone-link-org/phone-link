// server/src/routes/offer.routes.ts
import { Router } from 'express';
import { pool } from '../db';
import { Region } from '../../../shared/types';
import { RowDataPacket } from 'mysql2';

const router = Router();

router.get('/regions', async (req, res) => {
  const { parentId } = req.query;
  const [rows] = await pool.query<(Region & RowDataPacket)[]>(
    'SELECT region_id, parent_id, name FROM regions WHERE parent_id <=> ? ORDER BY name ASC',
    [parentId === 'null' ? null : parentId]
  );
  res.json(rows);
});


export default router;
