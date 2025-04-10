import express from 'express';

const router = express.Router();

import { addCompany } from "../controllers/company/addCompany.js"
import { getCompanies } from "../controllers/company/getCompanies.js"
import { updateCompany } from '../controllers/company/updateCompany.js';
import { getCompanyUserName } from '../controllers/company/getCompanyUserName.js'

router.get("/get", getCompanies);
router.get( '/companies/:CompanyUserName', getCompanyUserName );
router.post("/create", addCompany);
router.put('/update/:id', updateCompany);

export default router;
