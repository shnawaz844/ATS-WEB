import Job from '../../models/Job.js';

const getJobByTitleCode = async ( req, res ) => {
    try {
        const { titleCode } = req.params;
        const { company_id } = req.headers;

        const job = await Job.findOne( { titleCode, company_id } )
            .populate( 'status' )
            .populate( 'recruiterId' )
            .populate( 'hiringManagerId' );

        if ( !job ) {
            return res.status( 404 ).json( {
                success: false,
                message: 'Job not found'
            } );
        }

        res.status( 200 ).json( {
            success: true,
            job: job
        } );
    } catch ( error ) {
        console.error( 'Error fetching job:', error );
        res.status( 500 ).json( {
            success: false,
            message: error.message
        } );
    }
};
export { getJobByTitleCode };