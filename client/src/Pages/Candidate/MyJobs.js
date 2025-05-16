import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { toast } from 'react-toastify';
import {
    Briefcase,
    MapPin,
    Clock,
    EyeIcon,
    Edit2,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Phone,
    FileText,
    AlertCircle,
    X,
    Save,
    Check,
    FileUp,
    CircleUser,
    Mail,
    FolderDown,
    BookText
} from 'lucide-react';

const MyJobs = () => {
    const [ loginData, setLoginData ] = useState( null );
    const [ applications, setApplications ] = useState( [] );
    const [ selectedApp, setSelectedApp ] = useState( null );
    const [ file, setFile ] = useState( null );
    const [ isModalOpen, setIsModalOpen ] = useState( false );
    const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ totalPages, setTotalPages ] = useState( 1 );
    const [ updatedApplication, setUpdatedApplication ] = useState( null );
    const [ isLoading, setIsLoading ] = useState( true );
    const limit = 9;

    const fetchApplications = async () => {
        try {
            setIsLoading( true );
            if ( !loginData?._id ) return;
            const res = await fetch(
                `${ process.env.BASE_URL }/application/candidate/${ loginData._id }?page=${ currentPage }&limit=${ limit }`
            );
            const data = await res.json();
            setApplications( data.applications );
            setTotalPages( data.totalPages );
        } catch ( error ) {
            console.error( error );
        } finally {
            setIsLoading( false );
        }
    };

    const getStatusColor = ( status ) => {
        switch ( status ) {
            case 'New Submission':
                return 'bg-blue-100 text-blue-800';
            case 'In Review':
                return 'bg-yellow-100 text-yellow-800';
            case 'Accepted':
                return 'bg-green-100 text-green-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = ( status ) => {
        switch ( status ) {
            case 'New Submission':
                return <FileText className="h-4 w-4" />;
            case 'In Review':
                return <EyeIcon className="h-4 w-4" />;
            case 'Accepted':
                return <Check className="h-4 w-4" />;
            case 'Rejected':
                return <X className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const handleEdit = ( app ) => {
        setSelectedApp( app );
        setUpdatedApplication( {
            ...app,
            experience: app.experience || '',
            contactInfo: app.contactInfo || '',
            questions: app.questions ? JSON.parse( app.questions ) : [],
            answers: app.answers ? JSON.parse( app.answers ) : []
        } );
        setIsEditModalOpen( true );
    };

    const handleInputChange = ( e ) => {
        const { name, value } = e.target;
        setUpdatedApplication( ( prevState ) => ( {
            ...prevState,
            [ name ]: value,
        } ) );
    };

    const handleQuestionAnswerChange = ( index, field, value ) => {
        const updatedQuestionsAnswers = [ ...updatedApplication[ field ] ];
        updatedQuestionsAnswers[ index ] = value;
        setUpdatedApplication( ( prevState ) => ( {
            ...prevState,
            [ field ]: updatedQuestionsAnswers,
        } ) );
    };

    const handleFileUpload = ( e ) => {
        const selectedFile = e.target.files[ 0 ];
        setFile( selectedFile );
    };

    const handleSubmitEdit = async () => {
        try {
            const formData = new FormData();

            formData.append( "candidateID", updatedApplication.candidateID._id );
            formData.append( "jobID", updatedApplication.jobID._id );
            formData.append( "contactInfo", updatedApplication.contactInfo );
            formData.append( "experience", updatedApplication.experience );
            formData.append( "questions", JSON.stringify( updatedApplication.questions ) );
            formData.append( "answers", JSON.stringify( updatedApplication.answers ) );
            if ( file ) {
                formData.append( "resume", file );
            }

            const response = await fetch(
                `${ process.env.BASE_URL }/application/update-candidate-application/${ selectedApp._id }`,
                {
                    method: 'PUT',
                    body: formData
                }
            );
            const result = await response.json();
            if ( response.ok ) {
                setIsEditModalOpen( false );
                fetchApplications();
                toast.success( 'Application updated successfully' );
            } else {
                toast.error( 'Failed to update application' );
            }
        } catch ( error ) {
            console.error( 'Error updating application:', error );
        }
    };

    useEffect( () => {
        const token = localStorage.getItem( 'user' );
        const user = JSON.parse( token );
        setLoginData( user );
    }, [] );

    useEffect( () => {
        fetchApplications();
    }, [ loginData, currentPage ] );

    const capitalizeFirstLetter = ( string ) => {
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
    };


    return (
        <div className="px-8 py-4 w-full min-h-screen"
            style={ { background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' } }
        >
            <div className='mb-6 h-[15vh] flex items-center rounded-xl p-4 bg-gray-700'>
                <div className="flex justify-center items-center w-full">
                    <h1 className="text-center text-2xl md:text-3xl font-bold text-white flex justify-start items-center">
                        <Briefcase className="inline-block mr-4 mb-1 text-white" />
                        My Applications
                    </h1>
                </div>
            </div>


            { isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : applications.length > 0 ? (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    { applications.map( ( app ) => (
                        <div key={ app._id } className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-xl font-bold text-gray-800 capitalize line-clamp-1">{ capitalizeFirstLetter( app?.jobID?.title ) }</h2>
                                    <span className={ `flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${ ( getStatusColor( app.applicationStatus ) ) }` }>
                                        { getStatusIcon( app.applicationStatus ) }
                                        { capitalizeFirstLetter( app.applicationStatus ) }
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <CircleUser className="h-4 w-4 mr-2 text-gray-500" />
                                        { capitalizeFirstLetter( app?.candidateID.userName ) }
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                        { ( app?.candidateID.email ) }
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <FolderDown className="h-4 w-4 mr-2 text-gray-500" />
                                        { ( app?.jobID?.locationType ) }
                                    </p>
                                    <p className="text-sm text-gray-700 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                        { app?.jobID?.city }, { app?.jobID?.state }
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                        { app?.jobID?.shiftStart } - { app?.jobID?.shiftEnd }
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <div className="h-14 overflow-y-auto pr-1 transition-all duration-300 flex">
                                            <BookText className="h-4 w-4 mr-2 text-gray-500" />
                                            { capitalizeFirstLetter( app?.experience || 'No experience specified' ) }
                                        </div>
                                    </p>

                                    { app.submittedAt && (
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                                            Applied: { new Date( app.submittedAt ).toLocaleDateString() }
                                        </p>
                                    ) }
                                </div>

                                <div className="flex justify-between mt-5 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={ () => { setSelectedApp( app ); setIsModalOpen( true ); } }
                                        className="flex items-center bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-300 hover:text-black transition-colors text-sm shadow-md"
                                    >
                                        <EyeIcon className="h-4 w-4 mr-1" /> View
                                    </button>
                                    <button
                                        onClick={ () => handleEdit( app ) }
                                        className="flex items-center bg-gray-300 text-black px-4 py-2 rounded-xl hover:bg-gray-400 transition-colors text-sm shadow-md"
                                    >
                                        <Edit2 className="h-4 w-4 mr-1" /> Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) ) }
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <Briefcase className="h-16 w-16 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">No applications yet</h3>
                    <p className="mt-2 text-gray-600 max-w-md mx-auto">You haven't submitted any job applications yet. Start exploring open positions to begin your journey.</p>
                    <button className="mt-6 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors shadow-md">
                        Find Jobs
                    </button>
                </div>
            ) }

            { totalPages > 1 && (
                <div className="flex justify-center mt-10 space-x-4">
                    <button
                        disabled={ currentPage === 1 }
                        onClick={ () => setCurrentPage( ( prev ) => Math.max( prev - 1, 1 ) ) }
                        className="flex items-center w-32 px-4 py-2 bg-gray-700 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-center justify-center hover:bg-gray-800 transition-colors shadow-md"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </button>
                    <span className="px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200">
                        Page { currentPage } of { totalPages }
                    </span>
                    <button
                        disabled={ currentPage === totalPages }
                        onClick={ () => setCurrentPage( ( prev ) => Math.min( prev + 1, totalPages ) ) }
                        className="flex items-center w-32 px-4 py-2 bg-gray-700 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-center justify-center hover:bg-gray-800 transition-colors shadow-md"
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
            ) }

            <Modal isOpen={ isModalOpen } onClose={ () => setIsModalOpen( false ) } app={ selectedApp } getStatusColor={ getStatusColor } />

            {/* Enhanced Edit Modal */ }
            { isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300">
                        {/* Header */ }
                        <div className="flex justify-between items-center p-5 border-b bg-gray-700 border border-white rounded-t-xl">
                            <h2 className="text-xl font-semibold text-white">Edit Application</h2>
                            <button
                                onClick={ () => setIsEditModalOpen( false ) }
                                className="text-gray-300 hover:text-white bg-transparent rounded-full p-2 hover:bg-gray-500 transition-colors duration-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-8 space-y-8">
                            {/* Job Info */ }
                            <div className="bg-gray-200 rounded-xl p-6 border border-blue-100">
                                <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center">
                                    <Briefcase className="h-5 w-5 mr-2" />
                                    Job Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Title</p>
                                        <p className="font-semibold text-gray-800">{ selectedApp?.jobID?.title }</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                                        <p className="font-semibold text-gray-800">
                                            { selectedApp?.jobID?.city }, { selectedApp?.jobID?.state }
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Schedule</p>
                                        <p className="font-semibold text-gray-800">
                                            { selectedApp?.jobID?.shiftStart } - { selectedApp?.jobID?.shiftEnd }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Resume Upload */ }
                            <div className="space-y-1">
                                <label className="block text-gray-700 font-medium mb-1">Upload Resume</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="resume"
                                        onChange={ handleFileUpload }
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        required
                                    />
                                    <div className="flex items-center justify-between px-4 py-3 border border-gray-300 border-dashed rounded-md bg-gray-50 text-gray-500">
                                        <div className="flex items-center">
                                            <FileUp size={ 18 } className="mr-2" />
                                            <span>{ file ? file.name : "Upload your resume" }</span>
                                        </div>
                                        <span className="text-sm text-blue-500">Browse</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">PDF, DOCX, or RTF (Max 5MB)</p>
                            </div>

                            {/* Contact Info */ }
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Contact Information
                                </label>
                                <input
                                    type="text"
                                    name="contactInfo"
                                    value={ updatedApplication?.contactInfo || '' }
                                    onChange={ handleInputChange }
                                    placeholder="Phone, email, or other contact methods"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* Experience */ }
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Work Experience
                                </label>
                                <textarea
                                    name="experience"
                                    value={ updatedApplication?.experience || '' }
                                    onChange={ handleInputChange }
                                    placeholder="Describe your relevant work experience"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    rows="4"
                                />
                            </div>

                            {/* Questions */ }
                            { updatedApplication?.questions?.map( ( question, index ) => (
                                <div key={ index } className="bg-green-50 p-4 border border-green-200 rounded-xl space-y-2">
                                    <label className="block text-sm font-semibold text-green-700">Question { index + 1 }</label>
                                    <div className="bg-white p-3 rounded border border-gray-200 text-gray-700">{ question }</div>
                                    <label className="block text-sm font-medium text-gray-600">Your Answer</label>
                                    <textarea
                                        value={ updatedApplication?.answers[ index ] || '' }
                                        onChange={ ( e ) => handleQuestionAnswerChange( index, 'answers', e.target.value ) }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows="3"
                                    />
                                </div>
                            ) ) }

                            {/* Footer */ }
                            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={ () => setIsEditModalOpen( false ) }
                                    className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={ handleSubmitEdit }
                                    className="flex items-center px-6 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-300 hover:text-black transition-colors shadow-md"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            ) }
        </div>
    );
};

export default MyJobs;