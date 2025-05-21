import express from 'express';
import Hiringmanager from '../models/HiringManager.js';

const router = express.Router();

import { allHiringmanager } from '../controllers/HiringManager/allHiringmanager.js';

router.get( '/all-hiring-manager', allHiringmanager );

export default router;