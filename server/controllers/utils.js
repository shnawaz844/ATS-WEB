// utils/jobTitleCodeGenerator.js

/**
 * Generates a unique title code for a job
 * Format: TITLE-001-230115 (Title + Sequence + Date)
 * @param {string} title - Job title
 * @param {Array} existingJobs - Array of existing job objects
 * @returns {string} Unique title code
 */
export const generateTitleCode = ( title, existingJobs = [] ) => {
    if ( !title || typeof title !== 'string' ) {
        throw new Error( 'Title is required and must be a string' );
    }

    // Step 1: Clean and extract title abbreviation
    const titleAbbr = generateTitleAbbreviation( title );

    // Step 2: Generate sequence number for similar titles
    const sequence = generateSequenceNumber( titleAbbr, existingJobs );

    // Step 3: Add timestamp component (YYMMDD format)
    const timestamp = generateTimestamp();

    // Step 4: Combine all components
    const titleCode = `${ titleAbbr }-${ sequence }-${ timestamp }`;

    return titleCode;
};

/**
 * Generates title abbreviation (3-4 uppercase letters)
 */
const generateTitleAbbreviation = ( title ) => {
    // Remove special characters and extra spaces
    const cleanTitle = title
        .replace( /[^a-zA-Z0-9\s]/g, '' )
        .replace( /\s+/g, ' ' )
        .trim();

    // Different strategies based on word count
    const words = cleanTitle.split( ' ' );

    if ( words.length === 1 ) {
        // Single word: take first 4 characters
        return words[ 0 ].substring( 0, 4 ).toUpperCase();
    } else if ( words.length === 2 ) {
        // Two words: first 2 chars from each
        return words.map( word => word.substring( 0, 2 ) ).join( '' ).toUpperCase();
    } else {
        // Multiple words: first char from first three words
        return words.slice( 0, 3 ).map( word => word.charAt( 0 ) ).join( '' ).toUpperCase();
    }
};

/**
 * Generates sequence number for similar title abbreviations
 */
const generateSequenceNumber = ( titleAbbr, existingJobs ) => {
    if ( !existingJobs || existingJobs.length === 0 ) {
        return '001';
    }

    // Filter jobs with similar title codes
    const similarJobs = existingJobs.filter( job => {
        const jobTitleCode = job.titleCode || '';
        return jobTitleCode.startsWith( titleAbbr );
    } );

    // Get the next sequence number
    const nextSequence = similarJobs.length + 1;

    // Format as 3-digit number with leading zeros
    return nextSequence.toString().padStart( 3, '0' );
};

/**
 * Generates timestamp component (YYMMDD format)
 */
const generateTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice( -2 );
    const month = ( now.getMonth() + 1 ).toString().padStart( 2, '0' );
    const day = now.getDate().toString().padStart( 2, '0' );

    return `${ year }${ month }${ day }`;
};

/**
 * Alternative: Simple random-based generator
 * Format: TITLE-RANDOM (e.g., SWE-A1B2C3)
 */
export const generateSimpleTitleCode = ( title ) => {
    const titleAbbr = generateTitleAbbreviation( title );
    const randomSuffix = Math.random().toString( 36 ).substring( 2, 6 ).toUpperCase();

    return `${ titleAbbr }-${ randomSuffix }`;
};

export default {
    generateTitleCode,
    generateSimpleTitleCode
};