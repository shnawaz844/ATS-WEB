import InterviewSchedule from "../../models/Applicationlist.js";
import User from "../../models/User.js"; // Import the User model

// Function to fetch interviews
export const getInterviews = async ( req, res ) => {
    try {
        // Extract parameters from query
        const page = parseInt( req.query.page ) || 1; // Default to page 1
        const limit = parseInt( req.query.limit ) || 10; // Default limit to 10
        const interviewerEmail = req.query.interviewerEmail
            ? decodeURIComponent( req.query.interviewerEmail )
            : null; // Decode email safely

        // Extract company_id from headers
        const { company_id } = req.headers;

        // Pagination calculation
        const skip = ( page - 1 ) * limit;

        let filter = {}; // Default: fetch all interviews

        // If company_id is provided in the headers, add it to the filter
        if ( company_id ) {
            filter.company_id = company_id; // Filter by company_id from headers
        }

        // Add filter for interviewerEmail if provided
        if ( interviewerEmail ) {
            // Find the interviewer by email to get their ObjectId
            const interviewer = await User.findOne( { email: interviewerEmail } );
            if ( interviewer ) {
                filter.interviewerID = interviewer._id; // Filter by interviewer ObjectId
            } else {
                return res.status( 404 ).json( { message: "Interviewer not found" } );
            }
        }

        console.log( "Filter Applied:", filter );

        // Fetch interviews based on filter
        const interviews = await InterviewSchedule
            .find( filter ) // Apply filter dynamically
            .populate( {
                path: 'applicationID',
                select: 'jobID resume',
                populate: [
                    {
                        path: 'jobID',
                        select: 'title' // Selecting only the title from Job model
                    },
                    {
                        path: 'candidateID',
                        select: 'userName' // Selecting only the userName from Candidate model
                    },
                ],
            } )
            .populate( {
                path: 'interviewerID', // Populate interviewer details
                select: 'email name interviewer userName', // Fetch only necessary fields
            } )
            .skip( skip ) // Skip records based on pagination
            .limit( limit ); // Limit results per page

        // Get total count with applied filter
        const totalInterviews = await InterviewSchedule.countDocuments( filter );

        // Send response
        res.status( 200 ).json( {
            totalPages: Math.ceil( totalInterviews / limit ),
            currentPage: page,
            totalInterviews,
            interviews,
        } );
    } catch ( error ) {
        console.error( "Error fetching interviews:", error );
        res.status( 500 ).json( { message: "Internal server error" } );
    }
};

export default getInterviews;

