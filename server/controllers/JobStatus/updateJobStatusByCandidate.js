import JobStatus from "../../models/JobStatus.js";

const updateJobStatusByCandidate = async ( req, res ) => {
    try {
        const { jobID, candidateID, status } = req.body;

        // Log the request body for debugging
        console.log( "Update job type by candidate" );
        console.log( req.body );

        // Find the job status by candidateID and update it
        const updatedJobStatus = await JobStatus.findByIdAndUpdate(
            candidateID,
            {
                $push: {
                    jobs: {
                        jobID: jobID,
                        candidateID: candidateID,
                        status: status,
                    },
                },
            },
            { new: true } // To return the updated document
        );

        if ( !updatedJobStatus ) {
            return res.status( 404 ).json( { error: "Job status not found" } );
        }

        res.status( 200 ).json( updatedJobStatus );
    } catch ( error ) {
        res
            .status( 500 )
            .json( { error: "Failed to update job status by candidate" } );
    }
};

export { updateJobStatusByCandidate };
