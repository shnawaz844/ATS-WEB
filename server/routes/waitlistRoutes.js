import express from 'express';
import { addWaitlist } from '../controllers/Waitlist/addWaitlist.js';
import { getWaitlist } from '../controllers/Waitlist/getWaitlist.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/add-waitlist', upload.single('resume'), addWaitlist);
router.get('/get-waitlist', getWaitlist);

export default router;
