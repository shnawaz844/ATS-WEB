import InterviewSchedule from "../../models/Applicationlist.js";
import User from "../../models/User.js"; // Import the User model

// Function to fetch interviews
export const getInterviews = async ( req, res ) => {
    try {
        // Extract parameters from query
        const page = parseInt( req.query.page ) || 1; // Default to page 1
        const limit = parseInt( req.query.limit ) || 9; // Default limit to 10
        const interviewerEmail = req.query.interviewerEmail
            ? decodeURIComponent( req.query.interviewerEmail )
            : null; // Decode email safely
        const searchTerm = req.query.searchTerm || '';
        const filterStatus = req.query.filterStatus || '';
        console.log( "page>>>>>", page, limit, searchTerm, filterStatus );

        // Extract company_id from headers
        const { company_id } = req.headers;

        // Pagination calculation
        const skip = ( page - 1 ) * limit;

        // Build the base filter
        let filter = {};

        // If company_id is provided in the headers, add it to the filter
        if ( company_id ) {
            filter.company_id = company_id;
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

        // Add status filter if provided directly to the initial database query
        if ( filterStatus && filterStatus.trim() !== '' ) {
            filter.status = filterStatus;
        }

        // Get interviews that match the base filter (without search term)
        // We'll do the search term filtering after populating the fields
        const interviewsQuery = InterviewSchedule
            .find( filter )
            .populate( {
                path: 'applicationID',
                select: 'jobID candidateID resume',
                populate: [
                    {
                        path: 'jobID',
                        select: 'title'
                    },
                    {
                        path: 'candidateID',
                        select: 'userName'
                    },
                ],
            } )
            .populate( {
                path: 'interviewerID',
                select: 'email name interviewer userName',
            } )
            .sort( { createdAt: -1 } );

        // Get total count before applying search term
        const totalInterviewsBeforeSearch = await InterviewSchedule.countDocuments( filter );

        // Get all interviews that match the base filter
        let allInterviews = await interviewsQuery.exec();

        // Filter by search term if provided (after population)
        if ( searchTerm && searchTerm.trim() !== '' ) {
            const searchRegex = new RegExp( searchTerm, 'i' );
            allInterviews = allInterviews.filter( interview => {
                // Check job title
                const jobTitle = interview.applicationID?.jobID?.title || '';

                // Check candidate username
                const candidateUserName = interview.applicationID?.candidateID?.userName || '';

                // Check interviewer name
                const interviewerName = interview.interviewerID?.userName || '';

                return searchRegex.test( jobTitle ) ||
                    searchRegex.test( candidateUserName ) ||
                    searchRegex.test( interviewerName );
            } );
        }

        // Calculate total after search filter
        const totalInterviews = allInterviews.length;

        // Apply pagination to filtered results
        const interviews = allInterviews.slice( skip, skip + limit );

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