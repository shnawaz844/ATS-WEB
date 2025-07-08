import React, { useState } from "react";

import { Search, Plus, Edit, ChevronLeft, ChevronRight, Layers, FileText, AlertCircle } from "lucide-react";
import JobStatusDialog from "../../components/JobStatusDialog";
import { useAddJob, useJobStatuses, useUpdateJobStatus } from "../../hooks/useJobStatuses";

const JobStatus = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    jobStep: 0,
    jobStatus: "",
    company_id: "",
  });

  const companyId = JSON.parse(localStorage.getItem("user")).company_id;
  const {
    data: jobStatusesData,
    isLoading,
    isError,
    error,
  } = useJobStatuses({
    page: currentPage,
    limit: 12,
    search,
  });

  const { mutate: addJobStatus } = useAddJob();
  const { mutate: updateJobStatus } = useUpdateJobStatus();

  const jobStatuses = jobStatusesData?.jobStatuses || [];
  const totalPages = jobStatusesData?.totalPages || 1;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenAddDialog = () => {
    setDialogMode("add");
    setFormData({
      jobStep: "",
      jobStatus: "",
      company_id: companyId,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (job) => {
    setDialogMode("edit");
    setSelectedJob(job);
    setFormData({
      jobStep: job.jobStep || "",
      jobStatus: job.jobStatus || "",
      company_id: job.company_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedJob(null);
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
      formData.company_id = companyId;
      addJobStatus(formData, {
        onSuccess: handleCloseDialog,
        onError: (error) => console.error("Failed to add job status:", error),
      });
    } else {
      if (!selectedJob) return;
      updateJobStatus(
        {
          jobStatusId: selectedJob._id,
          formData,
        },
        {
          onSuccess: () => {
            alert("Job status updated successfully");
            handleCloseDialog();
          },
          onError: (error) => {
            console.error("Update failed:", error);
            alert("Failed to update job status");
          },
        }
      );
    }
  };

  // Define status badge styling based on job status
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
    <div
      className="px-4 sm:px-6 md:px-8 py-4 w-full min-h-screen"
      style={{ background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' }}
    >
      <div className="max-w-screen-2xl mx-auto">
        {/* Header Section */}
        <div className='mb-6 min-h-[80px] sm:h-[15vh] flex flex-col sm:flex-row items-center justify-between rounded-xl p-4 bg-gray-700 gap-4'>
          <div className="flex items-center w-full sm:w-auto">
            <Layers className="text-white h-6 w-6" />
            <h1 className="text-xl sm:text-2xl font-bold text-white ml-3">Job Statuses</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search Status..."
                value={search}
                onChange={handleSearchChange}
                className="w-full sm:w-[200px] md:w-[250px] pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            <button
              onClick={handleOpenAddDialog}
              className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 hover:text-white border border-white transition-colors duration-200 whitespace-nowrap shadow-sm w-full sm:w-auto text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add New Status</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="h-64 flex items-center justify-center px-4">
            <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 max-w-md w-full">
              <AlertCircle className="text-red-500 h-5 w-5" />
              <p className="text-red-600 text-sm sm:text-base">Error: {error.message}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {jobStatuses.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500 px-4 text-center">
                <FileText className="h-12 w-12 mb-4 text-gray-400" />
                <p className="text-sm sm:text-base">No job statuses found. Try adding a new one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 px-2 sm:px-0">
                {jobStatuses.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <span className="font-bold text-sm sm:text-base">{job.jobStep}</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Step {job.jobStep}</h3>
                      </div>
                      <button
                        onClick={() => handleOpenEditDialog(job)}
                        className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Edit"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    <div className="mt-2">
                      <span className="text-xs sm:text-sm text-gray-500">Status: </span>
                      <div className={`mt-1 px-3 py-1 rounded-full inline-flex items-center ${getStatusBadgeClass(job.jobStatus)}`}>
                        <span className="text-xs sm:text-sm font-medium">{job.jobStatus}</span>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>ID: {job._id.substring(0, 8)}...</span>
                        <span>Updated: {new Date(job.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
          </>
        )}

        {/* Dialog */}
        {isDialogOpen && (
          <JobStatusDialog
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

export default JobStatus;