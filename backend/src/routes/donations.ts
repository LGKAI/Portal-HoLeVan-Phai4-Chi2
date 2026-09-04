import { Router } from 'express';
import { getDonations, getAdminDonations, createDonation, verifyDonation, deleteDonation } from '../controllers/donationsController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getDonations);
router.get('/admin', verifyToken, requireAdmin, getAdminDonations);
router.post('/', createDonation);
router.put('/:id/verify', verifyToken, requireAdmin, verifyDonation);
router.delete('/:id', verifyToken, requireAdmin, deleteDonation);

export default router;
