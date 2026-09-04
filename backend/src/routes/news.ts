import { Router } from 'express';
import { getNews, getNewsBySlug, createNews, updateNews, deleteNews } from '../controllers/newsController';
import { verifyToken, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getNews);
router.get('/:slug', getNewsBySlug);
router.post('/', verifyToken, requireAdmin, upload.single('thumbnail'), createNews);
router.put('/:id', verifyToken, requireAdmin, upload.single('thumbnail'), updateNews);
router.delete('/:id', verifyToken, requireAdmin, deleteNews);

export default router;
