import express from 'express';
import { allHiringmanager } from '../controllers/HiringManager/allHiringmanager.js';

const router = express.Router();

router.get( '/all-hiring-manager', allHiringmanager );

export default router;