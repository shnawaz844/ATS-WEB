import express from 'express';
import { allHiringmanager } from '../controllers/HiringManager/allHiringmanager.js';
import { getDashboardStats } from '../controllers/HiringManager/getDashboardStats.js';
import { authenticate } from '../middleware/VerifyToken.js';

const router = express.Router();

router.get('/all-hiring-manager', allHiringmanager);
router.get('/dashboard-stats', authenticate, getDashboardStats);

export default router;