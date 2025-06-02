import Job from '../../models/Job.js';

const getJobs = async ( req, res ) => {
    try {
        let { page = 1, limit = 12, search, title, locationType, type, scheduleType, hireType, city, status } = req.query;
        let { company_id } = req.headers;
        // Convert page & limit to numbers safely
        const pageNumber = parseInt( page, 10 ) || 1;
        const limitNumber = Math.max( parseInt( limit, 10 ) || 12, 1 );

        let filter = {};

        // Apply filters only if values exist
        // if ( title ) filter.title = { $regex: title, $options: 'i' };
        if ( locationType ) filter.locationType = { $regex: locationType, $options: 'i' };
        if ( city ) filter.city = { $regex: city, $options: 'i' };
        if ( type ) filter.type = { $regex: type, $options: 'i' };
        if ( scheduleType ) filter.scheduleType = { $regex: scheduleType, $options: 'i' };
        if ( hireType ) filter.hireType = { $regex: hireType, $options: 'i' };
        if ( typeof search === 'string' && search.trim() !== '' ) {
            filter.title = { $regex: search.trim(), $options: 'i' };
        };
        if (title) filter.title = { $regex: title, $options: 'i' };
        if ( company_id ) filter.company_id = company_id;
        

        const totalCount = await Job.countDocuments( filter );

        const jobs = await Job.find( filter )
            .sort( { createdAt: -1 } )
            .skip( ( pageNumber - 1 ) * limitNumber )
            .limit( limitNumber );

        res.status( 200 ).json( {
            jobs,
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil( totalCount / limitNumber ),
        } );
    } catch ( error ) {
        res.status( 500 ).json( { message: error.message } );
    }
};

export { getJobs };
