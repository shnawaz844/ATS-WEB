import Job from '../../models/Job.js';
import uniqid from 'uniqid';
import { generateSimpleTitleCode, generateTitleCode } from '../utils.js';

const addJob = async ( req, res ) => {
    try {
        const {
            title,
            locationType,
            type,
            scheduleType,
            shiftStart,
            shiftEnd,
            hireType,
            country,
            state,
            city,
            description,
            compensation,
            experienceRequired,
            requiredResources,
            status,
            recruiterId,
            hiringManagerId,
            applicationForm,
            applicants,
            company_id,
        } = req.body;

        console.log( "Data on backend", req.body );

        // Get existing jobs for sequence calculation
        const existingJobs = await Job.find( { company_id: company_id } );

        // Generate title code
        let titleCode;
        try {
            titleCode = generateTitleCode( title, existingJobs );
        } catch ( error ) {
            console.error( 'Error generating title code, using fallback:', error );
            titleCode = generateSimpleTitleCode( title );
        }

        const job = new Job( {
            jobID: uniqid(),
            titleCode: titleCode,
            title,
            locationType,
            type,
            scheduleType,
            shiftStart,
            shiftEnd,
            hireType,
            country,
            state,
            city,
            description,
            compensation,
            experienceRequired,
            requiredResources,
            status,
            recruiterId,
            hiringManagerId,
            applicationForm: applicationForm || {},
            applicants: applicants || [],
            company_id,
        } );

        await job.save();

        console.log( `Job created successfully with title code: ${ titleCode }` );
        res.status( 201 ).json( {
            success: true,
            message: 'Job created successfully',
            job: job,
            titleCode: titleCode
        } );

    } catch ( error ) {
        console.error( 'Error creating job:', error );
        res.status( 500 ).json( {
            success: false,
            message: error.message
        } );
    }
};

export { addJob };
