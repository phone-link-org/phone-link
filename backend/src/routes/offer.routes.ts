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

router.get('/devices', async (req, res) => {
  try {
    const {
      brand,           // string
      model_KR,        // string
      storage,         // string
      topRegionIds,    // comma-separated string (ex: "1,2")
      subRegionIds,    // comma-separated string (ex: "10,11")
    } = req.query;

    // 쿼리 준비
    const conditions: string[] = [];
    const params: any[] = [];

    // 제조사 필터
    if (brand) {
      conditions.push(`d.brand = ?`);
      params.push(brand);
    }

    // 모델명 필터
    if (model_KR) {
      conditions.push(`d.model_KR = ?`);
      params.push(model_KR);
    }

    // 저장 용량 필터
    if (storage) {
      conditions.push(`d.storage = ?`);
      params.push(storage);
    }

    // 지역 조건은 실제 devices 테이블과 연결되는 구조가 필요
    // 현재 구조엔 지역 정보가 없으므로, 향후 device_regions 등의 테이블이 필요
    // 예시용 조건만 구성해 둡니다.
    if (topRegionIds || subRegionIds) {
      const regionIds = [];

      if (topRegionIds) {
        const topIds = (topRegionIds as string).split(',').map(id => parseInt(id));
        regionIds.push(...topIds);
      }

      if (subRegionIds) {
        const subIds = (subRegionIds as string).split(',').map(id => parseInt(id));
        regionIds.push(...subIds);
      }

      if (regionIds.length > 0) {
        // 예: device_regions 테이블이 있다고 가정
        conditions.push(`d.device_id IN (
          SELECT dr.device_id FROM device_regions dr WHERE dr.region_id IN (${regionIds.map(() => '?').join(',')})
        )`);
        params.push(...regionIds);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 최종 쿼리
    const [rows] = await pool.query(
      `
      SELECT 
        d.device_id,
        d.brand,
        d.model_KR,
        d.model_US,
        d.storage,
        d.retail_price,
        d.unlocked_price,
        d.coupang_link,
        d.created_at,
        di.image_url
      FROM devices d
      LEFT JOIN device_images di ON d.model_US = di.model_US
      ${whereClause}
      ORDER BY d.created_at DESC
      `,
      params
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router;
