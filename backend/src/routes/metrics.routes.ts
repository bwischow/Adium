import { Router } from 'express';
import {
  getUserMetrics,
  getMetricsByAdAccount,
} from '../controllers/metrics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getUserMetrics);
router.get('/account/:adAccountId', getMetricsByAdAccount);

export default router;
