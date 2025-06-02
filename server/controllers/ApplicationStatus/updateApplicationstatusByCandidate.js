import ApplicationStatus from "../../models/ApplicationStatus.js";

const updateApplicationStatusByCandidate = async ( req, res ) => {
  try {
    const { jobID, candidateID, status } = req.body;

    // Log the request body for debugging
    console.log( "Update application type by candidate" );
    console.log( req.body );

    // Find the application status by candidateID and update it
    const updatedApplicationStatus = await ApplicationStatus.findByIdAndUpdate(
      candidateID,
      {
        $push: {
          applications: {
            jobID: jobID,
            candidateID: candidateID,
            status: status,
          },
        },
      },
      { new: true } // To return the updated document
    );

    if ( !updatedApplicationStatus ) {
      return res.status( 404 ).json( { error: "Application status not found" } );
    }

    res.status( 200 ).json( updatedApplicationStatus );
  } catch ( error ) {
    res
      .status( 500 )
      .json( { error: "Failed to update application status by candidate" } );
  }
};

export { updateApplicationStatusByCandidate };
