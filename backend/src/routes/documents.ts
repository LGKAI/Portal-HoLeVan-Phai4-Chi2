import { Router } from 'express';
import { getDocuments, getDocumentById, uploadDocument, deleteDocument, updateDocument } from '../controllers/documentsController';
import { verifyToken, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.post('/', verifyToken, requireAdmin, upload.single('document'), uploadDocument);
router.put('/:id', verifyToken, requireAdmin, updateDocument);
router.delete('/:id', verifyToken, requireAdmin, deleteDocument);

export default router;
