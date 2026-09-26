import { Router } from 'express';
import { getNews, getNewsBySlug, createNews, updateNews, deleteNews, uploadNewsImage } from '../controllers/newsController';
import { verifyToken, requireAdmin, requireAdminOrElite } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getNews);
router.get('/:slug', getNewsBySlug);
router.post('/upload-image', verifyToken, requireAdminOrElite, upload.single('image'), uploadNewsImage);
router.post('/', verifyToken, requireAdminOrElite, upload.single('thumbnail'), createNews);
router.put('/:id', verifyToken, requireAdmin, upload.single('thumbnail'), updateNews);
router.delete('/:id', verifyToken, requireAdmin, deleteNews);

export default router;
