// controllers/ApplicationType/updateApplicationType.js

import ApplicationStatus from "../../models/ApplicationStatus.js";
// import bcrypt from "bcryptjs";

const updateApplicationStatus = async ( req, res ) => {
  try {
    const { id } = req.params; // Get the ID from the route parameter
    const { applicationStep, applicationStatus,company_id } = req.body; // Get the fields from the request body

    // Find the application type by ID
    const applicationType = await ApplicationStatus.findById( id );
    if ( !applicationType ) {
      return res.status( 404 ).json( {
        success: false,
        message: "Application not found",
      } );
    }

    // Update the fields
    applicationType.applicationStep = applicationStep;
    applicationType.applicationStatus = applicationStatus;
    applicationType.company_id = company_id;

    // Save the updated document
    await applicationType.save();

    // Return the updated data
    res.status( 200 ).json( { success: true, data: applicationType } );
  } catch ( error ) {
    // Catch and return errors
    res.status( 500 ).json( { message: error.message } );
  }
};

export { updateApplicationStatus };
