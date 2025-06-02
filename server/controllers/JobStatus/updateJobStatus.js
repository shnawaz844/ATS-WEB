import JobStatus from "../../models/JobStatus.js";
// import bcrypt from "bcryptjs";

const updateJobStatus = async ( req, res ) => {
    try {
        const { id } = req.params; // Get the ID from the route parameter
        const { jobStep, jobStatus, company_id } = req.body; // Get the fields from the request body

        // Find the job type by ID
        const jobType = await JobStatus.findById( id );
        if ( !jobType ) {
            return res.status( 404 ).json( {
                success: false,
                message: "Job status not found",
            } );
        }

        // Update the fields
        jobType.jobStep = jobStep;
        jobType.jobStatus = jobStatus;
        jobType.company_id = company_id;

        // Save the updated document
        await jobType.save();

        // Return the updated data
        res.status( 200 ).json( { success: true, data: jobType } );
    } catch ( error ) {
        // Catch and return errors
        res.status( 500 ).json( { message: error.message } );
    }
};

export { updateJobStatus };
