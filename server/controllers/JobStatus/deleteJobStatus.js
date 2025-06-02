import JobStatus from "../../models/JobStatus.js";

const deleteJobStatus = async ( req, res ) => {
    try {
        const { id } = req.params;
        await JobStatus.findByIdAndDelete( id );
        res.status( 200 ).json( { message: "Job status deleted successfully" } );
    } catch ( error ) {
        res.status( 500 ).json( { message: "Failed to delete Job status", error } );
    }
};

export { deleteJobStatus };
