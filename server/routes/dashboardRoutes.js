import express from 'express';
import { getAdminPerformanceStats } from '../controllers/Dashboard/getAdminPerformanceStats.js';

const router = express.Router();

router.get('/admin-performance-stats', getAdminPerformanceStats);

export default router;
