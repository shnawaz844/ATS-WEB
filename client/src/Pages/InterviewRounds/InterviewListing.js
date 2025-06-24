import React, { useState } from "react";
import { useInterviews, useAddInterview, useUpdateInterview } from "../../hooks/useInterviewRounds";
import InterViewDialog from "../../components/InterViewDialog";
import { Briefcase, ChevronLeft, ChevronRight, Edit, Search } from "lucide-react";

const InterviewListing = () => {
  const [ currentPage, setCurrentPage ] = useState( 1 );
  const [ search, setSearch ] = useState( "" );

  const [ isDialogOpen, setIsDialogOpen ] = useState( false );
  const [ dialogMode, setDialogMode ] = useState( "add" );
  const [ selectedInterview, setSelectedInterview ] = useState( null );
  const [ formData, setFormData ] = useState( {
    roundName: "",
    roundNumber: "",
    company_id: "",
  } );

  const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;

  const {
    data: interviewsData,
    isLoading,
    isError,
    error,
  } = useInterviews( {
    page: currentPage,
    limit: 12,
    search,
  } );
  const { mutate: addInterview } = useAddInterview();
  const { mutate: updateInterview } = useUpdateInterview();

  const interviews = interviewsData?.interviews || [];
  const totalPages = interviewsData?.totalPages || 1;

  const handleSearchChange = ( e ) => {
    setSearch( e.target.value );
    setCurrentPage( 1 );
  };

  const handleOpenAddDialog = () => {
    setDialogMode( "add" );
    setFormData( {
      roundName: "",
      roundNumber: "",
      company_id: companyId,
    } );
    setIsDialogOpen( true );
  };

  const handleOpenEditDialog = ( interview ) => {
    setDialogMode( "edit" );
    setSelectedInterview( interview );
    setFormData( {
      roundName: interview.roundName || "",
      roundNumber: interview.roundNumber || "",
      company_id: interview.company_id || "",
    } );
    setIsDialogOpen( true );
  };

  const handleCloseDialog = () => {
    setIsDialogOpen( false );
    setSelectedInterview( null );
  };

  const handleFormChange = ( e ) => {
    setFormData( ( prev ) => ( {
      ...prev,
      [ e.target.name ]: e.target.value,
    } ) );
  };

  const handleFormSubmit = ( e ) => {
    e.preventDefault();
    if ( dialogMode === "add" ) {
      addInterview( formData, {
        onSuccess: () => {
          alert( "Interview added successfully" );
          handleCloseDialog();
          // Trigger re-fetch of interviews here
          setCurrentPage( 1 );  // Optionally reset to the first page
        },
        onError: () => {
          alert( "Failed to add interview" );
        },
      } );
    } else {
      if ( !selectedInterview ) return;
      updateInterview(
        { interviewId: selectedInterview._id, formData },
        {
          onSuccess: () => {
            alert( "Interview updated successfully" );
            handleCloseDialog();
          },
          onError: () => {
            alert( "Failed to update Interview" );
          },
        }
      );
    }

  };

  return (
    <div className="px-8 py-4 w-full min-h-screen"
      style={ { background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' } }
    >
      <div className='mb-6 h-[15vh] flex items-center rounded-xl p-4 bg-gray-700'>
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Briefcase className="mr-2 h-6 w-6 text-white" />
              Interview Status
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search rounds..."
                value={ search }
                onChange={ handleSearchChange }
                className="w-full pl-10 pr-4 py-1.5 border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-none duration-200 h-[6.3vh]"
              />
            </div>

            {/* Add Button */ }
            <button
              onClick={ handleOpenAddDialog }
              className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-xl border border-white hover:bg-gray-600 transition-all duration-200 shadow-sm w-full sm:w-auto justify-center"
            >
              <span className="mr-2"><strong>+</strong></span>
              <strong>Add New Interview Round</strong>
            </button>
          </div>
        </div>
      </div>


      {/* Interview List */ }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        { isLoading && <p>Loading Interview Details...</p> }
        { isError && <p>Error: { error.message }</p> }
        { interviews.map( ( interview ) => (
          <div
            key={ interview._id }
            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col">
              <div className="flex items-center">
                <h3 className="font-semibold text-gray-900 mr-2">Round Name:</h3>
                <p className="text-lg font-semibold text-purple-800">{ interview.roundName }</p>
              </div>
              <div className="flex items-center mt-2">
                <h3 className="font-semibold text-gray-900 mr-2">Round Number:</h3>
                <p className="text-sm font-semibold text-green-800">{ interview.roundNumber }</p>
              </div>
              <button
                onClick={ () => handleOpenEditDialog( interview ) }
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Edit"
              >
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>ID: { interview._id.substring( 0, 8 ) }...</span>
                <span>Last updated:{ interview.updatedAt }</span>
              </div>
            </div>
          </div>
        ) ) }
      </div>

      {/* Pagination */ }
      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-2">
        <button
          onClick={ () => setCurrentPage( ( p ) => Math.max( 1, p - 1 ) ) }
          disabled={ currentPage === 1 }
          className={ `flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${ currentPage === 1
            ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
            : 'bg-gray-700 border border-gray-300 text-white hover:bg-gray-400 rounded-xl'
            }` }
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-1">
          <span className="px-3 py-1 bg-gray-200 text-black rounded-full font-medium">{ currentPage }</span>
          <span className="text-sm text-gray-500">of { totalPages }</span>
        </div>

        <button
          onClick={ () => setCurrentPage( ( p ) => Math.min( totalPages, p + 1 ) ) }
          disabled={ currentPage === totalPages }
          className={ `flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${ currentPage === totalPages
            ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
            : 'bg-gray-700 text-white hover:bg-gray-400 rounded-xl'
            }` }
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </button>
      </div>

      {/* Dialog Box */ }
      { isDialogOpen && (
        <InterViewDialog
          isOpen={ isDialogOpen }
          dialogMode={ dialogMode }
          formData={ formData }
          handleFormChange={ handleFormChange }
          handleFormSubmit={ handleFormSubmit }
          handleCloseDialog={ handleCloseDialog }
        />
      ) }
    </div>
  );
};

export default InterviewListing;

