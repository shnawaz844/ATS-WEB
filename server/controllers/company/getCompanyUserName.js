import express from 'express';
import Company from '../../models/company.js';  // Import your Company model

const router = express.Router();

export const getCompanyUserName = async ( req, res ) => {
    try {
        const { CompanyUserName } = req.params;
        console.log( "CompanyUserName>>>", CompanyUserName )
        const company = await Company.findOne( { CompanyUserName } );
        if ( !company ) {
            return res.status( 404 ).json( { message: 'Company not found' } );
        }
        res.json( company );
    } catch ( error ) {
        console.error( 'Error fetching company details:', error );
        res.status( 500 ).json( { message: 'Server error while fetching company details' } );
    }
};

// Define the route for fetching company by companyUserName
// router.get( '/companies/:companyUserName', getCompanyUserName );

export default router;
