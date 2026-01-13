import { Router } from 'express';
import {
  getAdAccounts,
  getAdAccount,
  deleteAdAccount,
  syncAdAccountMetrics,
} from '../controllers/adAccount.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAdAccounts);
router.get('/:id', getAdAccount);
router.delete('/:id', deleteAdAccount);
router.post('/:id/sync', syncAdAccountMetrics);

export default router;
