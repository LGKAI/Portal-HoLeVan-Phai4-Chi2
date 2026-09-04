import { Router } from 'express';
import { getFamilyTree, getAllMembers, getMemberById, createMember, updateMember, deleteMember, marryMember, addChildren, uploadAvatar } from '../controllers/membersController';
import { verifyToken, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/tree', getFamilyTree);
router.get('/', getAllMembers);
router.get('/:id', getMemberById);

router.post('/', verifyToken, requireAdmin, createMember);
router.put('/:id', verifyToken, requireAdmin, updateMember);
router.delete('/:id', verifyToken, requireAdmin, deleteMember);

router.post('/:id/marry', verifyToken, requireAdmin, marryMember);
router.post('/:id/children', verifyToken, requireAdmin, addChildren);
router.post('/:id/avatar', verifyToken, requireAdmin, upload.single('avatar'), uploadAvatar);

export default router;
