import Company from '../../models/company.js';

const deleteCompany = async ( req, res ) => {
    try {
        const { CompanyUserName } = req.params; // Using CompanyUserName as identifier

        // Check if company exists
        const company = await Company.findOne( { CompanyUserName } );
        if ( !company ) {
            return res.status( 404 ).json( { message: "Company not found." } );
        }

        // Delete the company
        await Company.findOneAndDelete( { CompanyUserName } );

        res.status( 200 ).json( { message: "Company deleted successfully." } );
    } catch ( error ) {
        res.status( 500 ).json( { message: error.message } );
    }
};

export { deleteCompany };