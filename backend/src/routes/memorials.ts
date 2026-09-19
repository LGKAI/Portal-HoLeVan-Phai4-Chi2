import { Router } from 'express';
import { getMemorials } from '../controllers/memorialsController';

const router = Router();

// GET /api/memorials - Lay danh sach lich gio ky tu DB
router.get('/', getMemorials);

export default router;