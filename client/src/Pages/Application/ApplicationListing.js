import React, { useState, useMemo } from "react";
import {
  useApplicationTypes,
  useAddApplication,
  useUpdateApplicationType,
} from "../../hooks/useApplication";
import ApplicationDialog from "../../components/ApplicationDialog";
import { Search, Plus, Edit, ChevronLeft, ChevronRight, Layers, FileText, AlertCircle } from "lucide-react";

const ApplicationListing = () => {
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

  const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;

  const {
    data: applicationTypesData,
    isLoading,
    isError,
    error,
  } = useApplicationTypes({
    page: currentPage,
    limit: 6,
    search,
  });

  const { mutate: addApplicationType } = useAddApplication();
  const { mutate: updateApplicationType } = useUpdateApplicationType();

  const applicationTypes = applicationTypesData?.applicationTypes || [];
  const totalPages = applicationTypesData?.totalPages || 1;

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
      addApplicationType(formData, {
        onSuccess: handleCloseDialog,
        onError: (error) => console.error("Failed to add application:", error),
      });
    } else {
      if (!selectedApplication) return;
      updateApplicationType(
        {
          applicationTypeId: selectedApplication._id,
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Layers className="text-indigo-600 h-6 w-6" />
            <h1 className="text-2xl font-bold text-gray-800">Application Types</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search Status..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200"
              />
            </div>
            
            <button
              onClick={handleOpenAddDialog}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add New Status</span>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {isError && (
          <div className="h-64 flex items-center justify-center">
            <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-500 h-5 w-5" />
              <p className="text-red-600">Error: {error.message}</p>
            </div>
          </div>
        )}
        
        {!isLoading && !isError && (
          <>
            {applicationTypes.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <FileText className="h-12 w-12 mb-4 text-gray-400" />
                <p>No application types found. Try adding a new one.</p>
              </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {applicationTypes.map((application) => (
                  <div
                    key={application._id}
                    className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <span className="font-bold">{application.applicationStep}</span>
                        </div>
                        <h3 className="font-semibold text-gray-800">Step {application.applicationStep}</h3>
                      </div>
                      <button
                        onClick={() => handleOpenEditDialog(application)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Edit"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">Status: </span>
                      <div className={`mt-1 px-3 py-1 rounded-full inline-flex items-center ${getStatusBadgeClass(application.applicationStatus)}`}>
                        <span className="text-sm font-medium">{application.applicationStatus}</span>
                      </div>
                    </div>
                    
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>ID: {application._id.substring(0, 8)}...</span>
                        <span>Last updated:{application.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-2">
              <button 
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className={`flex items-center px-4 py-2 rounded-lg border ${
                  currentPage <= 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md font-medium">{currentPage}</span>
                <span className="text-sm text-gray-500">of {totalPages}</span>
              </div>
              
              <button 
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className={`flex items-center px-4 py-2 rounded-lg border ${
                  currentPage >= totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </>
        )}
      </div>

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
  );
};

export default ApplicationListing;