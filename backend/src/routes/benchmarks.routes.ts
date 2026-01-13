import { Router } from 'express';
import {
  getBenchmarks,
  compareToBenchmark,
  triggerBenchmarkCalculation,
} from '../controllers/benchmarks.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getBenchmarks);
router.get('/compare', compareToBenchmark);
router.post('/calculate', triggerBenchmarkCalculation);

export default router;
