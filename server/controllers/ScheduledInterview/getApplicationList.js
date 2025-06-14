import InterviewSchedule from "../../models/Applicationlist.js";
import User from "../../models/User.js"; // Import the User model
import mongoose from "mongoose";

// Function to fetch interviews
export const getInterviews = async ( req, res ) => {console.log("api called")
    try {
        const page = parseInt( req.query.page ) || 1;
        const limit = parseInt( req.query.limit ) || 9;
        const candidateID = req.query.candidateID
        const jobId = req.query.jobID
        const interviewerID = decodeURIComponent( req.query.interviewerID || "" );
        const searchTerm = req.query.searchTerm || '';
        const filterStatus = req.query.filterStatus || '';
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
        if ( interviewerID ) {
            filter.interviewerID = interviewerID; // Filter by interviewer ObjectId
        }

        // Add status filter if provided directly to the initial database query
        if ( filterStatus && filterStatus.trim() !== '' && filterStatus.trim() !== 'all' ) {
            filter.status = filterStatus;
        }

        // Get interviews that match the base filter (without search term and candidateID)
        // We'll do the search term and candidateID filtering after populating the fields
        console.log( 'test filter', filter );
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

        // Get all interviews that match the base filter
        let allInterviews = await interviewsQuery.exec();
        console.log( "allInterviews before", allInterviews );


        // Filter by candidateID if provided (after population)
        if ( candidateID ) {
            allInterviews = allInterviews.filter( interview => interview.applicationID?.candidateID?._id?.toString() === candidateID );
        }

        if ( jobId ) {
            console.log( 'filter by jobId', jobId );
            allInterviews = allInterviews.filter( interview => {
                return interview.applicationID?.jobID?._id?.toString() === jobId;
            } );
        }
        console.log( "allInterviews after filter", allInterviews );

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

        // Calculate total after all filters
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