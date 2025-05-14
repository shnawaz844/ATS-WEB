import Application from '../../models/Application.js';
import Job from '../../models/Job.js';

const getAllApplicationsGroupedByJob = async ( req, res ) => {
    try {
        let { page = 1, limit = 6, title, city, locationType, type, scheduleType, hireType } = req.query;
        let { company_id } = req.headers;

        const pageNumber = parseInt( page, 10 ) || 1;
        const limitNumber = parseInt( limit, 10 ) || 6;

        console.log( "Starting optimized data retrieval with filters..." );

        // Step 1: Build job filter if any filter params are provided
        let jobFilter = {};
        if ( title ) jobFilter.title = { $regex: title, $options: 'i' };
        if ( city ) jobFilter.city = { $regex: city, $options: 'i' };
        if ( locationType ) jobFilter.locationType = { $regex: locationType, $options: 'i' };
        if ( type ) jobFilter.type = { $regex: type, $options: 'i' };
        if ( scheduleType ) jobFilter.scheduleType = { $regex: scheduleType, $options: 'i' };
        if ( hireType ) jobFilter.hireType = { $regex: hireType, $options: 'i' };

        if ( company_id ) jobFilter.company_id = company_id;
        
        // Step 2: Get all jobs based on filters (or all jobs if no filters)
        let filteredJobs = [];
        if ( Object.keys( jobFilter ).length > 0 ) {
            filteredJobs = await Job.find( jobFilter ).sort( { createdAt: -1 } );;
            console.log( `Found ${ filteredJobs.length } jobs matching filters` );
        } else {
            filteredJobs = await Job.find( {} ).sort( { createdAt: -1 } );
            console.log( `Found ${ filteredJobs.length } total jobs (no filters applied)` );
        }

        if ( filteredJobs.length === 0 ) {
            return res.status( 200 ).json( {
                totalJobs: 0,
                totalPages: 0,
                currentPage: pageNumber,
                data: []
            } );
        }

        // Step 3: Get all jobIDs that matched our filters
        const jobIds = filteredJobs.map( job => job._id );

        // Step 4: Get all applications for these jobs
        const applications = await Application.find( { jobID: { $in: jobIds } } );
        console.log( `Found ${ applications.length } applications for the filtered jobs` );

        if ( applications.length === 0 ) {
            return res.status( 200 ).json( {
                totalJobs: 0,
                totalPages: 0,
                currentPage: pageNumber,
                data: []
            } );
        }

        // Step 5: Count applications per job
        const jobApplicationCounts = {};
        applications.forEach( app => {
            const jobIdStr = app.jobID.toString();
            jobApplicationCounts[ jobIdStr ] = ( jobApplicationCounts[ jobIdStr ] || 0 ) + 1;
        } );

        // Step 6: Build the result data with job details and application counts
        const resultData = [];
        for ( const job of filteredJobs ) {
            const jobIdStr = job._id.toString();
            if ( jobApplicationCounts[ jobIdStr ] ) {
                resultData.push( {
                    jobID: job._id,
                    title: job.title,
                    city: job.city,
                    type: job.type,
                    scheduleType: job.scheduleType,
                    hireType: job.hireType,
                    compensation: job.compensation,
                    applicationCount: jobApplicationCounts[ jobIdStr ]
                } );
            }
        }

        console.log( `Built result data array with ${ resultData.length } jobs that have applications` );

        // Step 7: Sort by application count (highest first) as an example
        resultData.sort( ( a, b ) => b.applicationCount - a.applicationCount );

        // Step 8: Apply pagination
        const totalJobs = resultData.length;
        const totalPages = Math.ceil( totalJobs / limitNumber );
        const validPageNumber = Math.min( Math.max( 1, pageNumber ), Math.max( 1, totalPages ) );
        const start = ( validPageNumber - 1 ) * limitNumber;
        const paginatedData = resultData.slice( start, start + limitNumber );

        return res.status( 200 ).json( {
            totalJobs,
            totalPages,
            currentPage: validPageNumber,
            data: paginatedData
        } );
    } catch ( error ) {
        console.error( "Error in getAllApplicationsGroupedByJob:", error );
        return res.status( 500 ).json( {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        } );
    }
};

export { getAllApplicationsGroupedByJob };