import React, { useState } from "react";
import { useInterviews, useAddInterview, useUpdateInterview } from "../../hooks/useInterviewRounds";
import InterViewDialog from "../../components/InterViewDialog";
import { AlertCircle, Briefcase, ChevronLeft, ChevronRight, Edit, Search, FileText } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

const InterviewListing = () => {
  const { theme } = useTheme();
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
          handleCloseDialog();
          // Trigger re-fetch of interviews here
          setCurrentPage(1);  // Optionally reset to the first page
        },
        onError: (error) => {
          console.error("Failed to add interview:", error);
        },
      });
    } else {
      if (!selectedInterview) return;
      updateInterview(
        { interviewId: selectedInterview._id, formData },
        {
          onSuccess: () => {
            handleCloseDialog();
          },
          onError: (error) => {
            console.error("Failed to update Interview:", error);
          },
        }
      );
    }

  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-4 w-full min-h-screen transition-colors duration-300 bg-white dark:bg-black">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 min-h-[80px] sm:h-[15vh] flex flex-col sm:flex-row items-center justify-between rounded-xl p-4 gap-4 transition-all duration-300 backdrop-blur-xl bg-gray-200 dark:bg-transparent border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center w-full sm:w-auto">
            <div className="p-3 bg-[#9333ea]/10 rounded-full">
              <Briefcase className="h-6 w-6 text-[#9333ea]" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold ml-3 text-gray-900 dark:text-white">
              Interview Status
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search rounds..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:border-transparent duration-200 h-[40px] sm:h-[48px] text-sm sm:text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleOpenAddDialog}
              className="flex items-center justify-center px-3 sm:px-4 py-2 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl transition-all duration-200 shadow-md w-full sm:w-full text-sm sm:text-base"
            >
              <span className="mr-2"><strong>+</strong></span>
              <span>Add New Round</span>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#9333ea] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {isError && (
          <div className="h-64 flex items-center justify-center px-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-center gap-3 max-w-md w-full border border-red-200 dark:border-red-800">
              <AlertCircle className="text-red-500 dark:text-red-400 h-5 w-5" />
              <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">Error: {error.message}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {interviews.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500 px-4 text-center">
                <FileText className="h-12 w-12 mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">There are no Interview status et yet. Try adding a new one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 px-2 sm:px-0">
                {interviews.map((interview) => (
                  <div
                    key={interview._id}
                    className="backdrop-blur-xl bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#9333ea]/50 dark:hover:border-[#9333ea]/50 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center flex-wrap gap-1 mt-2">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Round Number:</h3>
                        <p className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">{interview.roundNumber}</p>
                      </div>
                      <div className="flex items-center flex-wrap gap-1">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Round Name:</h3>
                        <p className="text-sm sm:text-base font-semibold text-[#9333ea] dark:text-[#a855f7]">{interview.roundName}</p>
                      </div>
                      <button
                        onClick={() => handleOpenEditDialog(interview)}
                        className="self-end p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors mt-2"
                        aria-label="Edit"
                      >
                        <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>

                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>ID: {interview._id.substring(0, 8)}...</span>
                        <span>Updated: {new Date(interview.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {interviews.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6 mt-2 gap-4 sm:gap-0 px-2 sm:px-0">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors duration-200 w-full sm:w-auto justify-center ${currentPage === 1
                    ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed rounded-xl'
                    : 'bg-gray-700 dark:bg-gray-800 text-white border-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 rounded-xl'
                    }`}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  <span className="px-3 py-1 rounded-full font-medium text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
                    {currentPage}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">of {totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors duration-200 w-full sm:w-auto justify-center ${currentPage === totalPages
                    ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed rounded-xl'
                    : 'bg-gray-700 dark:bg-gray-800 text-white border-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 rounded-xl'
                    }`}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

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

