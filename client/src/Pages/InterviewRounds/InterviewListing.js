import React, { useState } from "react";
import { useInterviews, useAddInterview, useUpdateInterview } from "../../hooks/useInterviewRounds";
import InterViewDialog from "../../components/InterViewDialog";
import { AlertCircle, Briefcase, ChevronLeft, ChevronRight, Edit, Search } from "lucide-react";

const InterviewListing = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [formData, setFormData] = useState({
    roundName: "",
    roundNumber: "",
    company_id: "",
  });

  const companyId = JSON.parse(localStorage.getItem("user")).company_id;

  const {
    data: interviewsData,
    isLoading,
    isError,
    error,
  } = useInterviews({
    page: currentPage,
    limit: 12,
    search,
  });
  const { mutate: addInterview } = useAddInterview();
  const { mutate: updateInterview } = useUpdateInterview();

  const interviews = interviewsData?.interviews || [];
  const totalPages = interviewsData?.totalPages || 1;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenAddDialog = () => {
    setDialogMode("add");
    setFormData({
      roundName: "",
      roundNumber: "",
      company_id: companyId,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (interview) => {
    setDialogMode("edit");
    setSelectedInterview(interview);
    setFormData({
      roundName: interview.roundName || "",
      roundNumber: interview.roundNumber || "",
      company_id: interview.company_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedInterview(null);
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (dialogMode === "add") {
      addInterview(formData, {
        onSuccess: () => {
          alert("Interview added successfully");
          handleCloseDialog();
          // Trigger re-fetch of interviews here
          setCurrentPage(1);  // Optionally reset to the first page
        },
        onError: () => {
          alert("Failed to add interview");
        },
      });
    } else {
      if (!selectedInterview) return;
      updateInterview(
        { interviewId: selectedInterview._id, formData },
        {
          onSuccess: () => {
            alert("Interview updated successfully");
            handleCloseDialog();
          },
          onError: () => {
            alert("Failed to update Interview");
          },
        }
      );
    }

  };

  return (
    <div
      className="px-4 sm:px-6 md:px-8 py-4 w-full min-h-screen"
      style={{ background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' }}
    >
      <div className="max-w-screen-2xl mx-auto">
        {/* Header Section */}
        <div className='mb-6 min-h-[80px] sm:h-[15vh] flex flex-col sm:flex-row items-center justify-between rounded-xl p-4 bg-gray-700 gap-4'>
          <div className="flex items-center w-full sm:w-auto">
            <Briefcase className="mr-2 h-6 w-6 text-white" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Interview Status
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search rounds..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-none duration-200 h-[40px] sm:h-[48px] text-sm sm:text-base"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleOpenAddDialog}
              className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-xl border border-white hover:bg-gray-600 transition-all duration-200 shadow-sm w-full sm:w-full text-sm sm:text-base"
            >
              <span className="mr-2"><strong>+</strong></span>
              <span>Add New Round</span>
            </button>
          </div>
        </div>

        {/* Interview List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 px-2 sm:px-0">
          {isLoading && (
            <div className="col-span-full h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {isError && (
            <div className="col-span-full h-64 flex items-center justify-center px-4">
              <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 max-w-md w-full">
                <AlertCircle className="text-red-500 h-5 w-5" />
                <p className="text-red-600 text-sm sm:text-base">Error: {error.message}</p>
              </div>
            </div>
          )}

          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col">
                <div className="flex items-center flex-wrap gap-1">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Round Name:</h3>
                  <p className="text-sm sm:text-base font-semibold text-purple-800">{interview.roundName}</p>
                </div>
                <div className="flex items-center flex-wrap gap-1 mt-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Round Number:</h3>
                  <p className="text-xs sm:text-sm font-semibold text-green-800">{interview.roundNumber}</p>
                </div>
                <button
                  onClick={() => handleOpenEditDialog(interview)}
                  className="self-end p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors mt-2"
                  aria-label="Edit"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>ID: {interview._id.substring(0, 8)}...</span>
                  <span>Updated: {new Date(interview.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6 mt-2 gap-4 sm:gap-0 px-2 sm:px-0">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors duration-200 w-full sm:w-auto justify-center ${currentPage === 1
              ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
              : 'bg-gray-700 border border-gray-300 text-white hover:bg-gray-400 rounded-xl'
              }`}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            <span className="px-3 py-1 bg-gray-200 text-black rounded-full font-medium text-xs sm:text-sm">
              {currentPage}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">of {totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors duration-200 w-full sm:w-auto justify-center ${currentPage === totalPages
              ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
              : 'bg-gray-700 text-white hover:bg-gray-400 rounded-xl'
              }`}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        {/* Dialog Box */}
        {isDialogOpen && (
          <InterViewDialog
            isOpen={isDialogOpen}
            dialogMode={dialogMode}
            formData={formData}
            handleFormChange={handleFormChange}
            handleFormSubmit={handleFormSubmit}
            handleCloseDialog={handleCloseDialog}
          />
        )}
      </div>
    </div>
  );
};

export default InterviewListing;

