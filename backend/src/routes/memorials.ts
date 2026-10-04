import { Router } from 'express';
import { getMemorials, updateMemorial } from '../controllers/memorialsController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/memorials - Lay danh sach lich gio ky tu DB
router.get('/', getMemorials);

// PUT /api/memorials/:id - Quan tri vien cap nhat ngay gio ngoai le (hoac khoi phuc mac dinh)
router.put('/:id', verifyToken, requireAdmin, updateMemorial);

export default router;