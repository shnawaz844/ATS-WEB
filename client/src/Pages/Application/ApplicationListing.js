import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  useApplicationStatuses,
  useAddApplication,
  useUpdateApplicationStatus,
} from "../../hooks/useApplication";

import ApplicationDialog from "../../components/ApplicationDialog";
import { Search, Plus, Edit, ChevronLeft, ChevronRight, Layers, FileText, AlertCircle } from "lucide-react";

const ApplicationListing = () => {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [formData, setFormData] = useState({
    applicationStep: 0,
    applicationStatus: "",
    company_id: "",
  });

  const companyId = JSON.parse(localStorage.getItem("user")).company_id;
  const {
    data: applicationStatusesData,
    isLoading,
    isError,
    error,
  } = useApplicationStatuses({
    page: currentPage,
    limit: 12,
    search,
  });

  const { mutate: addApplicationStatus } = useAddApplication();
  const { mutate: updateApplicationStatus } = useUpdateApplicationStatus();

  const applicationStatuses = applicationStatusesData?.applicationStatuses || [];
  const totalPages = applicationStatusesData?.totalPages || 1;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenAddDialog = () => {
    setDialogMode("add");
    setFormData({
      applicationStep: "",
      applicationStatus: "",
      company_id: companyId,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (application) => {
    setDialogMode("edit");
    setSelectedApplication(application);
    setFormData({
      applicationStep: application.applicationStep || "",
      applicationStatus: application.applicationStatus || "",
      company_id: application.company_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedApplication(null);
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
      const submissionData = { ...formData, company_id: companyId };
      addApplicationStatus(submissionData, {
        onSuccess: handleCloseDialog,
        onError: (error) => console.error("Failed to add application:", error),
      });
    } else {
      if (!selectedApplication) return;
      updateApplicationStatus(
        {
          applicationStatusId: selectedApplication._id,
          formData,
        },
        {
          onSuccess: () => {
            alert("Application updated successfully");
            handleCloseDialog();
          },
          onError: (error) => {
            console.error("Update failed:", error);
            alert("Failed to update application");
          },
        }
      );
    }
  };

  // Define status badge styling based on application status
  const getStatusBadgeClass = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("complete") || lowerStatus.includes("approved"))
      return "bg-green-100 text-green-800";
    if (lowerStatus.includes("pending") || lowerStatus.includes("review"))
      return "bg-yellow-100 text-yellow-800";
    if (lowerStatus.includes("reject") || lowerStatus.includes("denied"))
      return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-4 w-full min-h-screen transition-colors duration-300 bg-white dark:bg-black">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 min-h-[80px] sm:h-[15vh] flex flex-col sm:flex-row items-center justify-between rounded-xl p-4 gap-4 transition-all duration-300 backdrop-blur-xl bg-gray-200 dark:bg-transparent border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center w-full sm:w-auto">
            <div className="p-3 bg-[#9333ea]/10 rounded-full">
              <Layers className="text-[#9333ea] h-6 w-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white ml-3">Application Statuses</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search Status..."
                value={search}
                onChange={handleSearchChange}
                className="w-full sm:w-[200px] md:w-[250px] pl-10 pr-4 py-2 rounded-xl border focus:ring-2 focus:ring-[#9333ea] focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <button
              onClick={handleOpenAddDialog}
              className="flex items-center justify-center px-3 sm:px-4 py-2 text-white rounded-xl transition-colors duration-200 whitespace-nowrap shadow-md w-full sm:w-auto text-sm sm:text-base bg-[#9333ea] hover:bg-[#7e22ce]"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add New Status</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#9333ea] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
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
            {applicationStatuses.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500 px-4 text-center">
                <FileText className="h-12 w-12 mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No application statuses found. Try adding a new one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 px-2 sm:px-0">
                {applicationStatuses.map((application) => (
                  <div
                    key={application._id}
                    className="backdrop-blur-xl bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#9333ea]/50 dark:hover:border-[#9333ea]/50 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base bg-[#9333ea]/10 text-[#9333ea]">
                          <span>{application.applicationStep}</span>
                        </div>
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Step {application.applicationStep}</h3>
                      </div>
                      <button
                        onClick={() => handleOpenEditDialog(application)}
                        className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                        aria-label="Edit"
                      >
                        <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>

                    <div className="mt-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Status: </span>
                      <div className={`mt-1 px-3 py-1 rounded-full inline-flex items-center ${getStatusBadgeClass(application.applicationStatus)}`}>
                        <span className="text-xs sm:text-sm font-medium">{application.applicationStatus}</span>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>ID: {application._id.substring(0, 8)}...</span>
                        <span>Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
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
          </>
        )}

        {/* Dialog */}
        {isDialogOpen && (
          <ApplicationDialog
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

export default ApplicationListing;