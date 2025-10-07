import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, X, Download, Eye, Calendar, FileText, Grid, List, User, Loader, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportApplication() {
    const [ uploadedFiles, setUploadedFiles ] = useState( [] );
    const [ selectedFile, setSelectedFile ] = useState( null );
    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState( '' );
    const [ viewMode, setViewMode ] = useState( 'card' );
    const [ fileToUpload, setFileToUpload ] = useState( null );
    const [ userFiles, setUserFiles ] = useState( [] );
    const [ loadingFileData, setLoadingFileData ] = useState( false );
    const [ creatingJobs, setCreatingJobs ] = useState( false );
    const [ jobCreationStatus, setJobCreationStatus ] = useState( null );
    const [ jobStatuses, setJobStatuses ] = useState( [] );
    const [ jobStatusMap, setJobStatusMap ] = useState( {} );
    const [ loadingStatuses, setLoadingStatuses ] = useState( false );
    const [ statusError, setStatusError ] = useState( null );

    // Hiring managers state
    const [ hiringManagersList, setHiringManagersList ] = useState( [] );
    const [ hiringManagerMap, setHiringManagerMap ] = useState( {} );
    const [ loadingHiringManagers, setLoadingHiringManagers ] = useState( false );

    // NEW: Recruiter managers state
    const [ recruitersList, setRecruitersList ] = useState( [] );
    const [ recruiterMap, setRecruiterMap ] = useState( {} );
    const [ loadingRecruiters, setLoadingRecruiters ] = useState( false );

    // User state - get this from localStorage
    const [ user, setUser ] = useState( {
        role: 'hiring_manager',
        userName: 'shah nawaz ahmad',
        userId: null,
        companyId: null
    } );

    const formatMonth = ( date ) => {
        return new Date( date ).toLocaleString( "default", { month: "long", year: "numeric" } );
    };

    // Fetch hiring managers when companyId is available
    useEffect( () => {
        const fetchHiringManagers = async () => {
            if ( !user.companyId ) return;

            setLoadingHiringManagers( true );
            try {
                const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/hiringmanager/all-hiring-manager`, {
                    headers: {
                        'company_id': user.companyId
                    }
                } );

                if ( !response.ok ) {
                    throw new Error( 'Failed to fetch hiring managers' );
                }

                const data = await response.json();
                console.log( 'Hiring Managers API Response:', data );

                if ( data && Array.isArray( data ) ) {
                    setHiringManagersList( data );

                    // Build comprehensive lookup map
                    const map = {};
                    data.forEach( manager => {
                        const managerId = manager._id;

                        // Extract different name variations
                        const userName = manager.userName || '';
                        const email = manager.email || '';
                        const name = manager.name || '';

                        if ( managerId ) {
                            // Map by userName (as-is and cleaned versions)
                            if ( userName ) {
                                map[ userName ] = managerId; // Original format: "shah_nawaz_ahmad"
                                map[ userName.toLowerCase() ] = managerId;
                                map[ userName.replace( /_/g, ' ' ) ] = managerId; // "shah nawaz ahmad"
                                map[ userName.replace( /_/g, ' ' ).toLowerCase() ] = managerId;

                                // Handle title case versions
                                const titleCase = userName.replace( /_/g, ' ' )
                                    .split( ' ' )
                                    .map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ).toLowerCase() )
                                    .join( ' ' );
                                map[ titleCase ] = managerId; // "Shah Nawaz Ahmad"
                                map[ titleCase.toLowerCase() ] = managerId;
                            }

                            // Map by email
                            if ( email ) {
                                map[ email ] = managerId;
                                map[ email.toLowerCase() ] = managerId;
                            }

                            // Map by name field if exists
                            if ( name ) {
                                map[ name ] = managerId;
                                map[ name.toLowerCase() ] = managerId;
                            }
                        }
                    } );

                    setHiringManagerMap( map );
                    console.log( "Hiring manager map loaded:", map );
                } else {
                    console.warn( 'Hiring managers data is not an array:', data );
                }
            } catch ( error ) {
                console.error( 'Error fetching hiring managers:', error );
            } finally {
                setLoadingHiringManagers( false );
            }
        };

        if ( user.companyId ) {
            fetchHiringManagers();
        }
    }, [ user.companyId ] );

    // NEW: Fetch recruiters when companyId is available
    useEffect( () => {
        const fetchRecruiters = async () => {
            if ( !user.companyId ) return;

            setLoadingRecruiters( true );
            try {
                const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/recruiter/all-recruiter`, {
                    headers: {
                        'company_id': user.companyId
                    }
                } );

                if ( !response.ok ) {
                    throw new Error( 'Failed to fetch recruiters' );
                }

                const data = await response.json();
                console.log( 'Recruiters API Response:', data );

                if ( data && Array.isArray( data ) ) {
                    setRecruitersList( data );

                    // Build comprehensive lookup map for recruiters
                    const map = {};
                    data.forEach( recruiter => {
                        const recruiterId = recruiter._id;

                        // Extract different name variations
                        const userName = recruiter.userName || '';
                        const email = recruiter.email || '';
                        const name = recruiter.name || '';

                        if ( recruiterId ) {
                            // Map by userName (as-is and cleaned versions)
                            if ( userName ) {
                                map[ userName ] = recruiterId;
                                map[ userName.toLowerCase() ] = recruiterId;
                                map[ userName.replace( /_/g, ' ' ) ] = recruiterId;
                                map[ userName.replace( /_/g, ' ' ).toLowerCase() ] = recruiterId;

                                // Handle title case versions
                                const titleCase = userName.replace( /_/g, ' ' )
                                    .split( ' ' )
                                    .map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ).toLowerCase() )
                                    .join( ' ' );
                                map[ titleCase ] = recruiterId;
                                map[ titleCase.toLowerCase() ] = recruiterId;
                            }

                            // Map by email
                            if ( email ) {
                                map[ email ] = recruiterId;
                                map[ email.toLowerCase() ] = recruiterId;
                            }

                            // Map by name field if exists
                            if ( name ) {
                                map[ name ] = recruiterId;
                                map[ name.toLowerCase() ] = recruiterId;
                            }
                        }
                    } );

                    setRecruiterMap( map );
                    console.log( "Recruiter map loaded:", map );
                } else {
                    console.warn( 'Recruiters data is not an array:', data );
                }
            } catch ( error ) {
                console.error( 'Error fetching recruiters:', error );
            } finally {
                setLoadingRecruiters( false );
            }
        };

        if ( user.companyId ) {
            fetchRecruiters();
        }
    }, [ user.companyId ] );

    // Fetch job statuses when companyId is available
    useEffect( () => {
        const fetchJobStatuses = async () => {
            setLoadingStatuses( true );
            setStatusError( null );
            try {
                const companyId = user.companyId;
                if ( !companyId ) return;

                const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/job-statuses/all-job-statuses`, {
                    headers: {
                        'company_id': companyId
                    }
                } );

                if ( !response.ok ) {
                    throw new Error( 'Failed to fetch job statuses' );
                }

                const data = await response.json();
                console.log( 'Job Statuses API Response:', data );

                if ( data.jobStatuses && Array.isArray( data.jobStatuses ) ) {
                    setJobStatuses( data.jobStatuses );

                    // build lookup: status name → ID
                    const map = {};
                    data.jobStatuses.forEach( ( st ) => {
                        map[ st.jobStatus ] = st._id; // Map status name to ID
                    } );
                    setJobStatusMap( map );
                    console.log( "Job status map loaded:", map );
                } else {
                    throw new Error( 'Invalid data format received' );
                }
            } catch ( error ) {
                console.error( 'Error fetching job statuses:', error );
                setStatusError( error.message );
                setJobStatuses( [] );
            } finally {
                setLoadingStatuses( false );
            }
        };

        if ( user.companyId ) {
            fetchJobStatuses();
        }
    }, [ user.companyId ] );

    // Fetch user files from backend on component mount
    useEffect( () => {
        // Get user data from localStorage
        try {
            const userData = JSON.parse( localStorage.getItem( "user" ) || "{}" );
            console.log( "User data from localStorage:", userData );

            setUser( {
                role: userData.role || 'hiring_manager',
                userName: userData.userName || userData.name || 'shah nawaz ahmad',
                userId: userData.userId || userData.id || userData._id || 'default_user_id',
                companyId: userData.companyId || userData.company_id || 'default_company_id'
            } );
        } catch ( error ) {
            console.error( 'Error parsing user data from localStorage:', error );
            // Set default values if localStorage parsing fails
            setUser( {
                role: 'hiring_manager',
                userName: 'shah nawaz ahmad',
                userId: 'default_user_id',
                companyId: 'default_company_id'
            } );
        }
    }, [] );

    // Fetch user files when user data is available
    useEffect( () => {
        if ( user.userId && user.companyId ) {
            fetchUserFiles();
        }
    }, [ user.userId, user.companyId ] );

    function capitalizeFirstLetter( string ) {
        if ( !string ) return "";
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
    }

    const fetchUserFiles = async () => {
        try {
            setLoading( true );

            // Add query parameters for filtering
            const queryParams = new URLSearchParams( {
                userId: user.userId,
                companyId: user.companyId,
                role: user.role // Add role to query params
            } );

            // If user is admin, we don't need user-specific filters
            if ( user.role === 'admin' ) {
                queryParams.delete( 'userId' );
                queryParams.delete( 'companyId' );
                // Admin can see all files
            }

            const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/upload/user-files?${ queryParams }` );

            if ( !response.ok ) throw new Error( 'Failed to fetch user files' );

            const data = await response.json();

            // Transform the data to match your component expectations
            const transformedFiles = ( data.files || data || [] ).map( file => ( {
                id: file._id || file.id,
                fileName: file.filename || file.fileName,
                fileSize: file.size || file.fileSize,
                fileUrl: file.file || file.fileUrl,
                uploadDate: file.uploadDate,
                userName: file.userName || 'Unknown User',
                userId: file.userId,
                companyId: file.companyId
            } ) );

            setUserFiles( transformedFiles );
        } catch ( err ) {
            console.error( 'Error fetching user files:', err );
            setError( 'Failed to load user files' );
        } finally {
            setLoading( false );
        }
    };

    // UPDATED: This function now includes hiring manager AND recruiter mapping
    const createJobsFromExcelData = async ( fileData, fileUrl ) => {
        // Prevent multiple simultaneous executions
        if ( creatingJobs ) {
            console.log( 'Job creation already in progress' );
            return;
        }

        // Wait for hiring managers, recruiters and statuses to load if they're still loading
        if ( loadingHiringManagers || loadingRecruiters || loadingStatuses ) {
            console.log( 'Waiting for hiring managers, recruiters and job statuses to load...' );
            await new Promise( resolve => setTimeout( resolve, 1000 ) );

            // If still loading after wait, show error
            if ( loadingHiringManagers || loadingRecruiters || loadingStatuses ) {
                setError( 'Hiring managers, recruiters or job statuses are still loading. Please try again in a moment.' );
                return;
            }
        }

        if ( !fileData || !fileData.headers || !fileData.data ) {
            console.error( "Invalid file data structure received:", {
                fileDataExists: !!fileData,
                headersExist: !!fileData?.headers,
                dataExist: !!fileData?.data,
                fileData: fileData
            } );
            throw new Error( 'No valid data found in the file' );
        }

        setCreatingJobs( true );
        setJobCreationStatus( null );

        try {
            // Map Excel columns to job fields
            const headers = fileData.headers.map( h => h.toLowerCase().trim() );
            const data = fileData.data;

            // Find column indices
            const titleIndex = headers.findIndex( h => h.includes( 'title' ) );
            const locationTypeIndex = headers.findIndex( h => h.includes( 'location type' ) );
            const typeIndex = headers.findIndex( h => h.includes( 'type' ) );
            const scheduleTypeIndex = headers.findIndex( h => h.includes( 'schedule type' ) );
            const shiftStartIndex = headers.findIndex( h => h.includes( 'shift start' ) );
            const shiftEndIndex = headers.findIndex( h => h.includes( 'shift end' ) );
            const hireTypeIndex = headers.findIndex( h => h.includes( 'hire type' ) );
            const countryIndex = headers.findIndex( h => h.includes( 'country' ) );
            const stateIndex = headers.findIndex( h => h.includes( 'state' ) );
            const cityIndex = headers.findIndex( h => h.includes( 'city' ) );
            const compensationIndex = headers.findIndex( h => h.includes( 'compensation' ) );
            const experienceRequiredIndex = headers.findIndex( h =>
                h.includes( 'experience required' ) ||
                h.includes( 'experience' ) ||
                h.includes( 'exp required' ) ||
                h.includes( 'exp' )
            );
            const requiredResourcesIndex = headers.findIndex( h => h.includes( 'required resources' ) );
            const statusIndex = headers.findIndex( h => h.includes( 'applicationStatus' ) );
            const hiringManagerIndex = headers.findIndex( h =>
                h.includes( 'hiring manager' ) ||
                h.includes( 'hiring_manager' ) ||
                h.includes( 'manager' ) ||
                h.includes( 'hiring manager name' )
            );
            const recruiterManagerIndex = headers.findIndex( h =>
                h.includes( 'recruter manager' ) ||
                h.includes( 'recruiter manager' ) ||
                h.includes( 'recruiter_manager' ) ||
                h.includes( 'recruiter' )
            );

            const jobsToCreate = [];
            const errors = [];

            // Process each row
            for ( let i = 0; i < data.length; i++ ) {
                const row = data[ i ];

                // Skip empty rows
                if ( !row.some( cell => cell && cell.toString().trim() !== '' ) ) continue;

                try {
                    const statusName = row[ statusIndex ] || 'Active';
                    const hiringManagerName = hiringManagerIndex >= 0 ? row[ hiringManagerIndex ] : '';
                    const recruiterManagerName = recruiterManagerIndex >= 0 ? row[ recruiterManagerIndex ] : '';

                    // Get status ID from the map, fallback to empty string if not found
                    let statusId = '';
                    if ( jobStatusMap[ statusName ] ) {
                        statusId = jobStatusMap[ statusName ];
                    } else {
                        console.warn( `Status "${ statusName }" not found in application status map. Available statuses:`, Object.keys( jobStatusMap ) );
                        // Try to find a default status
                        statusId = jobStatusMap[ 'Active' ] || jobStatusMap[ 'active' ] || '';
                    }

                    // Get hiring manager ID from the map
                    let hiringManagerId = user.userId; // Default to current user
                    let actualHiringManagerName = hiringManagerName;

                    if ( hiringManagerName && hiringManagerName.toString().trim() !== '' ) {
                        const hiringManagerNameStr = hiringManagerName.toString().trim();

                        console.log( `Looking up hiring manager: "${ hiringManagerNameStr }"` );

                        // Try exact match first
                        let foundId = hiringManagerMap[ hiringManagerNameStr ];

                        // Try lowercase match
                        if ( !foundId ) {
                            foundId = hiringManagerMap[ hiringManagerNameStr.toLowerCase() ];
                        }

                        // Try with underscores replaced by spaces
                        if ( !foundId ) {
                            const withSpaces = hiringManagerNameStr.replace( /_/g, ' ' );
                            foundId = hiringManagerMap[ withSpaces ] || hiringManagerMap[ withSpaces.toLowerCase() ];
                        }

                        // Try title case version
                        if ( !foundId ) {
                            const titleCase = hiringManagerNameStr
                                .toLowerCase()
                                .split( ' ' )
                                .map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
                                .join( ' ' );
                            foundId = hiringManagerMap[ titleCase ] || hiringManagerMap[ titleCase.toLowerCase() ];
                        }

                        if ( foundId ) {
                            hiringManagerId = foundId;
                            console.log( `✅ Successfully mapped hiring manager "${ hiringManagerNameStr }" to ID: ${ hiringManagerId }` );
                        } else {
                            console.warn( `❌ Hiring manager "${ hiringManagerNameStr }" not found. Available managers:`, Object.keys( hiringManagerMap ) );
                            console.warn( 'Using current user as default hiring manager' );
                            actualHiringManagerName = user.userName || 'Current User';
                        }
                    } else {
                        console.log( 'ℹ️ No hiring manager specified in Excel, using current user as default' );
                        actualHiringManagerName = user.userName || 'Current User';
                    }

                    // Get recruiter manager ID from the map
                    let recruiterManagerId = user.userId; // Default to current user
                    let actualRecruiterManagerName = recruiterManagerName;

                    if ( recruiterManagerName && recruiterManagerName.toString().trim() !== '' ) {
                        const recruiterManagerNameStr = recruiterManagerName.toString().trim();

                        console.log( `Looking up recruiter manager: "${ recruiterManagerNameStr }"` );

                        // Try exact match first
                        let foundId = recruiterMap[ recruiterManagerNameStr ];

                        // Try lowercase match
                        if ( !foundId ) {
                            foundId = recruiterMap[ recruiterManagerNameStr.toLowerCase() ];
                        }

                        // Try with underscores replaced by spaces
                        if ( !foundId ) {
                            const withSpaces = recruiterManagerNameStr.replace( /_/g, ' ' );
                            foundId = recruiterMap[ withSpaces ] || recruiterMap[ withSpaces.toLowerCase() ];
                        }

                        // Try title case version
                        if ( !foundId ) {
                            const titleCase = recruiterManagerNameStr
                                .toLowerCase()
                                .split( ' ' )
                                .map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
                                .join( ' ' );
                            foundId = recruiterMap[ titleCase ] || recruiterMap[ titleCase.toLowerCase() ];
                        }

                        if ( foundId ) {
                            recruiterManagerId = foundId;
                            console.log( `✅ Successfully mapped recruiter manager "${ recruiterManagerNameStr }" to ID: ${ recruiterManagerId }` );
                        } else {
                            console.warn( `❌ Recruiter manager "${ recruiterManagerNameStr }" not found. Available recruiters:`, Object.keys( recruiterMap ) );
                            console.warn( 'Using current user as default recruiter manager' );
                            actualRecruiterManagerName = user.userName || 'Current User';
                        }
                    } else {
                        console.log( 'ℹ️ No recruiter manager specified in Excel, using current user as default' );
                        actualRecruiterManagerName = user.userName || 'Current User';
                    }

                    const experienceRequiredValue = experienceRequiredIndex >= 0 ? row[ experienceRequiredIndex ] : undefined;
                    let experienceRequired = '0'; // default as string

                    if ( experienceRequiredValue !== undefined && experienceRequiredValue !== null ) {
                        experienceRequired = experienceRequiredValue.toString().trim();

                        if ( experienceRequired === '' ) {
                            experienceRequired = '0';
                        }
                    }

                    const jobData = {
                        title: row[ titleIndex ] || 'Untitled Position',
                        // NOTE: titleCode will be generated in the backend
                        locationType: row[ locationTypeIndex ] || 'On-Site',
                        type: row[ typeIndex ] || 'Full-Time',
                        scheduleType: row[ scheduleTypeIndex ] || 'Flexible',
                        shiftStart: row[ shiftStartIndex ] || '09:00',
                        shiftEnd: row[ shiftEndIndex ] || '17:00',
                        hireType: row[ hireTypeIndex ] || 'New',
                        country: row[ countryIndex ] || 'India',
                        state: row[ stateIndex ] || '',
                        city: row[ cityIndex ] || '',
                        description: `Position for ${ row[ titleIndex ] || 'Untitled Position' }. Imported from Excel file.`,
                        compensation: row[ compensationIndex ] || '0',
                        experienceRequired: experienceRequired,
                        requiredResources: parseInt( row[ requiredResourcesIndex ] ) || 1,
                        status: statusId,
                        statusName: statusName,
                        hiringManagerName: actualHiringManagerName,
                        recruiterManagerName: actualRecruiterManagerName,
                        recruiterId: recruiterManagerId,
                        hiringManagerId: hiringManagerId,
                        applicationForm: {},
                        applicants: [],
                        company_id: user.companyId
                    };

                    // Validate required fields
                    if ( !jobData.title || jobData.title.trim() === '' ) {
                        throw new Error( 'Title is required' );
                    }

                    jobsToCreate.push( jobData );
                } catch ( rowError ) {
                    errors.push( `Row ${ i + 1 }: ${ rowError.message }` );
                }
            }

            if ( jobsToCreate.length === 0 ) {
                throw new Error( 'No valid job data found in the file' );
            }

            console.log( `Sending ${ jobsToCreate.length } jobs to backend in ONE API call` );
            console.log( 'Sample job data:', jobsToCreate[ 0 ] );

            // Make ONE API call to backend with ALL job data
            const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/upload/create-jobs-from-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( {
                    fileUrl,
                    fileName: 'excel-import.xlsx',
                    userId: user.userId,
                    companyId: user.companyId,
                    fileData: {
                        headers: fileData.headers,
                        data: fileData.data
                    },
                    jobStatusMap: jobStatusMap,
                    hiringManagerMap: hiringManagerMap,
                    recruiterMap: recruiterMap
                } )
            } );

            if ( !response.ok ) {
                const errorData = await response.json();
                throw new Error( errorData.error || errorData.message || 'Failed to create jobs' );
            }

            const result = await response.json();

            console.log( "Backend response:", result );

            setJobCreationStatus( {
                total: result.totalProcessed || jobsToCreate.length,
                successful: result.jobsCreated || 0,
                failed: result.errors ? result.errors.length : 0,
                details: result
            } );

            if ( result.jobsCreated > 0 ) {
                alert( `Successfully created ${ result.jobsCreated } jobs!` );
            } else {
                alert( 'No jobs were created. Please check your file format.' );
            }

            return result;

        } catch ( error ) {
            console.error( 'Error creating jobs:', error );
            setJobCreationStatus( {
                total: 0,
                successful: 0,
                failed: 0,
                error: error.message
            } );
            throw error;
        } finally {
            setCreatingJobs( false );
        }
    };

    // Updated function to fetch and parse Excel file from URL using a proxy endpoint
    const fetchAndParseFile = async ( fileUrl, fileName ) => {
        try {
            setLoadingFileData( true );
            setError( '' ); // Clear any previous errors

            const proxyResponse = await fetch( `${ process.env.REACT_APP_BASE_URL }/upload/proxy-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( {
                    fileUrl: fileUrl,
                    fileName: fileName
                } )
            } );

            if ( !proxyResponse.ok ) {
                throw new Error( `Failed to fetch file through proxy: ${ proxyResponse.status }` );
            }

            const arrayBuffer = await proxyResponse.arrayBuffer();

            // Parse the file based on its type
            let headers = [];
            let data = [];

            if ( fileName.toLowerCase().endsWith( '.csv' ) ) {
                const decoder = new TextDecoder( 'utf-8' );
                const text = decoder.decode( arrayBuffer );
                const rows = text.split( '\n' ).filter( row => row.trim() );

                if ( rows.length > 0 ) {
                    headers = rows[ 0 ].split( ',' ).map( h => h.trim().replace( /"/g, '' ) );
                    data = rows.slice( 1 ).map( row => {
                        const cells = row.split( ',' ).map( cell => cell.trim().replace( /"/g, '' ) );
                        return cells;
                    } );
                }
            } else {
                const workbook = XLSX.read( arrayBuffer, { type: 'array' } );
                const firstSheetName = workbook.SheetNames[ 0 ];
                const worksheet = workbook.Sheets[ firstSheetName ];
                const jsonData = XLSX.utils.sheet_to_json( worksheet, { header: 1 } );

                if ( jsonData.length > 0 ) {
                    headers = jsonData[ 0 ] || [];
                    data = jsonData.slice( 1 );
                }
            }

            const parsedFile = {
                id: 'remote_' + Date.now(),
                name: fileName,
                fileName: fileName,
                headers: headers,
                data: data,
                rowCount: data.length,
                isRemote: true
            };

            setSelectedFile( parsedFile );
        } catch ( error ) {
            console.error( 'Error fetching and parsing file:', error );
            setError( `Failed to load and parse the file: ${ error.message }. This might be due to CORS restrictions.` );
        } finally {
            setLoadingFileData( false );
        }
    };

    const handleFileSelect = ( event ) => {
        const file = event.target.files[ 0 ];
        if ( file ) {
            setFileToUpload( file );
            setError( "" );
        }
    };

    const uploadFileToServer = async () => {
        if ( !fileToUpload ) {
            setError( "Please select a file before uploading" );
            return;
        }

        if ( !user.userId || !user.companyId ) {
            setError( "User information is missing. Please refresh the page and try again." );
            return;
        }

        const formData = new FormData();
        formData.append( "file", fileToUpload );
        formData.append( "userId", user.userId );
        formData.append( "companyId", user.companyId );
        formData.append( "userName", user.userName || 'Unknown User' );

        try {
            setLoading( true );
            const res = await fetch(
                `${ process.env.REACT_APP_BASE_URL }/upload/application`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await res.json();

            if ( !res.ok ) {
                throw new Error( data.error || data.message || "Upload failed" );
            }

            console.log( "File uploaded successfully", data );
            alert( "File uploaded successfully!" );
            setFileToUpload( null );
            setError( "" );

            fetchUserFiles();
        } catch ( err ) {
            console.error( "Upload error:", err );
            setError( `Error uploading file: ${ err.message }` );
        } finally {
            setLoading( false );
        }
    };

    const deleteFile = ( fileId ) => {
        setUploadedFiles( prev => prev.filter( f => f.id !== fileId ) );
        if ( selectedFile && selectedFile.id === fileId ) {
            setSelectedFile( null );
        }
    };

    const openFile = ( file ) => {
        setSelectedFile( file );
    };

    const closeFileView = () => {
        setSelectedFile( null );
    };

    const formatFileSize = ( bytes ) => {
        if ( bytes === 0 ) return '0 Bytes';
        const k = 1024;
        const sizes = [ 'Bytes', 'KB', 'MB', 'GB' ];
        const i = Math.floor( Math.log( bytes ) / Math.log( k ) );
        return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( 2 ) + ' ' + sizes[ i ] );
    };

    const formatDate = ( date ) => {
        return new Date( date ).toLocaleDateString() + ' ' + new Date( date ).toLocaleTimeString();
    };

    const formatRole = ( role ) => {
        return role ? role.replace( /_/g, ' ' ).replace( /\b\w/g, l => l.toUpperCase() ) : 'Unknown Role';
    };

    const fetchAndParseFileForJobCreation = async ( fileUrl, fileName ) => {
        try {
            console.log( "Fetching file for job creation from:", fileUrl );

            const proxyResponse = await fetch( `${ process.env.REACT_APP_BASE_URL }/upload/proxy-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( {
                    fileUrl: fileUrl,
                    fileName: fileName
                } )
            } );

            if ( !proxyResponse.ok ) {
                throw new Error( `Failed to fetch file through proxy: ${ proxyResponse.status }` );
            }

            const arrayBuffer = await proxyResponse.arrayBuffer();
            console.log( "File fetched successfully, size:", arrayBuffer.byteLength );

            let headers = [];
            let data = [];

            if ( fileName.toLowerCase().endsWith( '.csv' ) ) {
                const decoder = new TextDecoder( 'utf-8' );
                const text = decoder.decode( arrayBuffer );
                const rows = text.split( '\n' ).filter( row => row.trim() );

                console.log( "CSV rows found:", rows.length );

                if ( rows.length > 0 ) {
                    headers = rows[ 0 ].split( ',' ).map( h => h.trim().replace( /"/g, '' ) );
                    data = rows.slice( 1 ).map( row => {
                        const cells = row.split( ',' ).map( cell => cell.trim().replace( /"/g, '' ) );
                        return cells;
                    } );
                }
            } else {
                const workbook = XLSX.read( arrayBuffer, { type: 'array' } );
                const firstSheetName = workbook.SheetNames[ 0 ];
                const worksheet = workbook.Sheets[ firstSheetName ];
                const jsonData = XLSX.utils.sheet_to_json( worksheet, { header: 1 } );

                console.log( "Excel data parsed, rows:", jsonData.length );

                if ( jsonData.length > 0 ) {
                    headers = jsonData[ 0 ] || [];
                    data = jsonData.slice( 1 );
                    data = data.filter( row => row.some( cell => cell !== null && cell !== undefined && cell.toString().trim() !== '' ) );
                }
            }

            console.log( "Final parsed headers:", headers );
            console.log( "Final parsed data rows:", data.length );

            return {
                headers: headers,
                data: data,
                rowCount: data.length
            };

        } catch ( error ) {
            console.error( 'Error fetching and parsing file for job creation:', error );
            throw error;
        }
    };

    // User File Card Component
    const UserFileCard = React.memo( ( { file } ) => {
        const handleCreateJobs = async ( e ) => {
            if ( e ) {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
            }

            if ( creatingJobs || loadingHiringManagers || loadingRecruiters ) {
                console.log( 'Job creation or manager loading in progress - ignoring click' );
                return;
            }

            try {
                console.log( "Starting job creation process for file:", file.fileName );
                console.log( "Current hiring manager map:", hiringManagerMap );
                console.log( "Current application status map:", jobStatusMap );

                const parsedFileData = await fetchAndParseFileForJobCreation( file.fileUrl, file.fileName );

                console.log( "Parsed file data for job creation:", parsedFileData );

                if ( !parsedFileData ) {
                    throw new Error( 'Failed to parse file data' );
                }

                if ( !parsedFileData.headers || !parsedFileData.data ) {
                    console.error( "Invalid parsed data structure:", parsedFileData );
                    throw new Error( 'Parsed data is missing headers or data' );
                }

                await createJobsFromExcelData( parsedFileData, file.fileUrl );

            } catch ( error ) {
                console.error( 'Error in handleCreateJobs:', error );
                setError( `Failed to create jobs: ${ error.message }` );
            }
        };

        const handleViewFile = async ( e ) => {
            if ( e ) {
                e.preventDefault();
                e.stopPropagation();
            }

            if ( loadingFileData || creatingJobs ) return;

            try {
                setLoadingFileData( true );
                await fetchAndParseFile( file.fileUrl, file.fileName );
            } catch ( error ) {
                console.error( 'Error viewing file:', error );
                setError( `Failed to view file: ${ error.message }` );
            } finally {
                setLoadingFileData( false );
            }
        };

        return (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="text-green-600" size={ 24 } />
                        <div>
                            <h3 className="font-semibold text-gray-800 truncate max-w-40" title={ file.fileName }>
                                { file.fileName }
                            </h3>
                            <p className="text-sm text-gray-500">{ formatFileSize( file.fileSize ) }</p>
                        </div>
                    </div>
                    <a
                        href={ file.fileUrl }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Download file"
                        onClick={ ( e ) => e.stopPropagation() }
                    >
                        <Download size={ 16 } />
                    </a>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={ 14 } />
                        <span>{ user.userName || 'Unknown User' }</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={ 14 } />
                        <span>Created at: { formatDate( file.uploadDate ) }</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={ 14 } />
                        <span>Month: { formatMonth( file.uploadDate ) }</span>
                    </div>
                </div>

                <button
                    onClick={ handleViewFile }
                    disabled={ loadingFileData || creatingJobs }
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                >
                    { loadingFileData ? (
                        <>
                            <Loader className="animate-spin" size={ 16 } />
                            Loading...
                        </>
                    ) : (
                        <>
                            <Eye size={ 16 } />
                            View File
                        </>
                    ) }
                </button>
                <button
                    onClick={ handleCreateJobs }
                    disabled={ loadingFileData || creatingJobs || loadingStatuses || loadingHiringManagers }
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    { creatingJobs ? (
                        <>
                            <Loader className="animate-spin" size={ 16 } />
                            Creating Jobs...
                        </>
                    ) : loadingStatuses || loadingHiringManagers ? (
                        <>
                            <Loader className="animate-spin" size={ 16 } />
                            Loading Data...
                        </>
                    ) : (
                        <>
                            <Plus size={ 16 } />
                            Create Jobs from File
                        </>
                    ) }
                </button>
            </div>
        );
    } );

    const FileCard = ( { file } ) => (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FileSpreadsheet className="text-green-600" size={ 24 } />
                    <div>
                        <h3 className="font-semibold text-gray-800 truncate max-w-40" title={ file.name }>
                            { file.name }
                        </h3>
                        <p className="text-sm text-gray-500">{ formatFileSize( file.size ) }</p>
                    </div>
                </div>
                <button
                    onClick={ () => deleteFile( file.id ) }
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete file"
                >
                    <X size={ 16 } />
                </button>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={ 14 } />
                    <span>{ formatDate( file.uploadDate ) }</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={ 14 } />
                    <span>{ file.rowCount } rows</span>
                </div>
            </div>

            <button
                onClick={ () => openFile( file ) }
                className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
                <Eye size={ 16 } />
                View Data
            </button>
        </div>
    );

    const FileListItem = ( { file } ) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <FileSpreadsheet className="text-green-600" size={ 24 } />
                <div>
                    <h3 className="font-semibold text-gray-800">{ file.name }</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{ formatFileSize( file.size ) }</span>
                        <span>{ file.rowCount } rows</span>
                        <span>{ formatDate( file.uploadDate ) }</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={ () => openFile( file ) }
                    className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Eye size={ 16 } />
                    View
                </button>
                <button
                    onClick={ () => deleteFile( file.id ) }
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Delete file"
                >
                    <X size={ 16 } />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* User Info Header */ }
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex flex-col md:flex-row items-start justify-between">
                    {/* Left: User Info */ }
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-500 text-white rounded-full p-3 shadow-md">
                            <User size={ 24 } />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800">
                                Welcome,{ " " }
                                <span className="text-blue-600">
                                    { capitalizeFirstLetter( user.userName ) || "User" }
                                </span>
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    { formatRole( user.role ) }
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                User ID: { user.userId } | Company ID: { user.companyId }
                                { loadingStatuses && " | Loading statuses..." }
                                { loadingHiringManagers && " | Loading hiring managers..." }
                                { !loadingStatuses && jobStatuses.length > 0 && ` | ${ jobStatuses.length } statuses loaded` }
                                { !loadingHiringManagers && hiringManagersList.length > 0 && ` | ${ hiringManagersList.length } hiring managers loaded` }
                            </div>
                        </div>
                    </div>

                    {/* Right: Upload Section */ }
                    {/* { user.role !== 'admin' && ( */}
                        <div className="mt-4 md:mt-0 flex flex-col items-end text-right">
                            <div className="flex items-center gap-2 mb-2">
                                <label className="cursor-pointer">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500 text-white text-sm shadow hover:bg-blue-600 transition-colors">
                                        <Upload size={ 16 } />
                                        Upload File
                                    </div>
                                    <input
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={ handleFileSelect }
                                        className="hidden"
                                    />
                                </label>

                                {/* Sample Excel File Download Button */ }
                                <button
                                    onClick={ () => {
                                        const sampleFileUrl = 'https://docs.google.com/spreadsheets/d/1Cj3s75X46plhnxhT19QN-yE5SCHs9cq1/edit?usp=drive_link&ouid=114134967406279256151&rtpof=true&sd=true';
                                        window.open( sampleFileUrl, '_blank' );
                                    } }
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500 text-white text-sm shadow hover:bg-green-600 transition-colors"
                                    title="Download sample Excel template"
                                >
                                    <Download size={ 16 } />
                                    Sample Excel File
                                </button>
                            </div>

                            { fileToUpload && (
                                <div className="mt-3 text-sm text-gray-600 w-full md:w-auto">
                                    <p className="truncate mb-2">Selected: { fileToUpload.name }</p>
                                    <button
                                        onClick={ uploadFileToServer }
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors"
                                        disabled={ loading }
                                    >
                                        { loading ? "Uploading..." : "Upload" }
                                    </button>
                                </div>
                            ) }

                            <p className="mt-2 text-gray-500 text-xs">Supports .csv, .xlsx, and .xls</p>
                        </div>
                    {/* // ) } */}
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    { loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-600">Processing file...</p>
                        </div>
                    ) }

                    { error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            { error }
                        </div>
                    ) }

                    {/* User Files Section */ }
                    { userFiles.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Uploaded User's Report Files ({ userFiles.length })
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                { userFiles.map( file => (
                                    <UserFileCard key={ file.id } file={ file } />
                                ) ) }
                            </div>
                        </div>
                    ) }

                    { uploadedFiles.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Local Files ({ uploadedFiles.length })
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={ () => setViewMode( 'card' ) }
                                        className={ `p-2 rounded-lg ${ viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600' }` }
                                    >
                                        <Grid size={ 16 } />
                                    </button>
                                    <button
                                        onClick={ () => setViewMode( 'list' ) }
                                        className={ `p-2 rounded-lg ${ viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600' }` }
                                    >
                                        <List size={ 16 } />
                                    </button>
                                </div>
                            </div>

                            { viewMode === 'card' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    { uploadedFiles.map( file => (
                                        <FileCard key={ file.id } file={ file } />
                                    ) ) }
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    { uploadedFiles.map( file => (
                                        <FileListItem key={ file.id } file={ file } />
                                    ) ) }
                                </div>
                            ) }
                        </div>
                    ) }

                    { uploadedFiles.length === 0 && userFiles.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500">
                            <FileSpreadsheet size={ 64 } className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">No files uploaded yet</p>
                            <p className="text-sm">Upload files to see them here</p>
                        </div>
                    ) }
                </div>

                {/* Modal for viewing file data */ }
                { selectedFile && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">

                            {/* Header */ }
                            <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-50 to-white">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    { selectedFile.name || selectedFile.fileName }
                                </h3>
                                <button
                                    onClick={ closeFileView }
                                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                >
                                    <X size={ 28 } />
                                </button>
                            </div>

                            {/* File Info */ }
                            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                                <p className="text-gray-600 text-sm">
                                    Showing <span className="font-medium">{ selectedFile.rowCount }</span> rows
                                    { selectedFile.size && ` • ${ formatFileSize( selectedFile.size ) }` }
                                </p>
                            </div>

                            {/* Table */ }
                            <div className="p-4 overflow-auto flex-grow">
                                { selectedFile.headers && selectedFile.data ? (
                                    <div className="border rounded-xl shadow-sm overflow-auto max-h-[60vh]">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100 sticky top-0 z-10">
                                                <tr>
                                                    {/* Index Column Header */ }
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-200 sticky left-0 z-20">
                                                        #
                                                    </th>
                                                    { selectedFile.headers.map( ( header, index ) => (
                                                        <th
                                                            key={ index }
                                                            className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                                        >
                                                            { header || `Column ${ index + 1 }` }
                                                        </th>
                                                    ) ) }
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                { selectedFile.data.map( ( row, rowIndex ) => (
                                                    <tr
                                                        key={ rowIndex }
                                                        className="hover:bg-blue-50 transition-colors duration-200"
                                                    >
                                                        {/* Index Column Cell */ }
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 sticky left-0 z-10 border-r">
                                                            { rowIndex + 1 }
                                                        </td>
                                                        { row.map( ( cell, cellIndex ) => (
                                                            <td
                                                                key={ cellIndex }
                                                                className="px-5 py-3 whitespace-nowrap text-sm text-gray-900"
                                                            >
                                                                { cell }
                                                            </td>
                                                        ) ) }
                                                    </tr>
                                                ) ) }
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-400 text-lg">No data available to display</p>
                                    </div>
                                ) }
                            </div>
                        </div>
                    </div>
                ) }

                {/* Loading overlay for file data */ }
                { loadingFileData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 shadow-xl">
                            <div className="flex items-center gap-3">
                                <Loader className="animate-spin text-blue-500" size={ 24 } />
                                <p className="text-gray-700">Loading file data...</p>
                            </div>
                        </div>
                    </div>
                ) }
            </div>
        </div>
    );
}