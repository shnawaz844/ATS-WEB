import express from 'express';

const router = express.Router();

import { addCompany } from "../controllers/company/addCompany.js"
import { getCompanies } from "../controllers/company/getCompanies.js"
import { updateCompany } from '../controllers/company/updateCompany.js'
import { getCompanyUserName } from '../controllers/company/getCompanyUserName.js'
import { deleteCompany } from '../controllers/company/deleteCompany.js'
import upload from '../middleware/upload.js';

router.get("/get", getCompanies);
router.get( '/companies/:CompanyUserName', getCompanyUserName );
router.post( "/create", upload.single( 'image' ), addCompany);
router.put('/update/:id', upload.single('image'), updateCompany);
router.delete( '/delete/:CompanyUserName', deleteCompany );

export default router;
