import React, { useState } from "react";
import { useInterviews, useAddInterview, useUpdateInterview } from "../../hooks/useInterviewRounds";
import InterViewDialog from "../../components/InterViewDialog";
import { Edit } from "lucide-react";

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
    limit: 9,
    search,
  } );
  console.log( "interviewsData>>><<<<", interviewsData )
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

  const goToPreviousPage = () => {
    if ( currentPage > 1 ) setCurrentPage( ( p ) => p - 1 );
  };

  const goToNextPage = () => {
    if ( currentPage < totalPages ) setCurrentPage( ( p ) => p + 1 );
  };

  if ( isLoading ) return <p>Loading Interview Details...</p>;
  if ( isError ) return <p>Error: { error.message }</p>;

  return (
    <div className="w-screen mx-auto px-4 py-8 h-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Interview Management</h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search rounds..."
                value={ search }
                onChange={ handleSearchChange }
                className="w-full pl-10 pr-4 py-2 rounded-lg focus:border-transparent hover:bg-lightGray bg-gray-100"
              />
            </div>

            {/* Add Button */ }
            <button
              onClick={ handleOpenAddDialog }
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm w-full sm:w-auto justify-center"
            >
              <span className="mr-2"><strong>+</strong></span>
              <strong>Add New Interview Round</strong>
            </button>
          </div>
        </div>

        {/* Interview List */ }
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          { interviews.map( ( interview ) => (
            <div
              key={ interview._id }
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md border border-black hover:shadow-lg transition-all duration-200 h-[20vh]"> */ }
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
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          { currentPage > 1 ? (
            <button onClick={ () => setCurrentPage( ( p ) => p - 1 ) } className="px-4 py-2 bg-white border rounded-lg">← Previous</button>
          ) : (
            <div className="w-[84px]"></div>
          ) }
          <span className="text-sm text-gray-600">Page { currentPage } of { totalPages }</span>
          { currentPage < totalPages ? (
            <button onClick={ () => setCurrentPage( ( p ) => p + 1 ) } className="px-4 py-2 bg-white border rounded-lg">Next →</button>
          ) : (
            <div className="w-[84px]"></div>
          ) }
        </div>
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

