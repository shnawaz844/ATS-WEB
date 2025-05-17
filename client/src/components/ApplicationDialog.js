import React from "react";
import PropTypes from "prop-types";

const ApplicationDialog = ({
  dialogMode,
  formData,
  handleFormChange,
  handleFormSubmit,
  handleCloseDialog,
}) => {

  // Close the dialog when clicking outside (on the overlay)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseDialog(); // Ensure handleCloseDialog is called
    }
  };
  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="px-6 py-4">
          <h2 className="text-[1.5rem] font-semibold text-gray-800">
            {dialogMode === 'add' ? 'Add New Application' : 'Edit User Details'}
          </h2>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Step
              </label>
              <input
                type="number"
                name="applicationStep"
                value={formData.applicationStep}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Status
              </label>
              <input
                type="text"
                name="applicationStatus"
                value={formData.applicationStatus}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>


          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseDialog}
              className="px-4 py-2 text-sm font-medium text-black bg-gray-400 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-xl hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {dialogMode === 'add' ? 'Add Application' : 'Update Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ApplicationDialog.propTypes = {
  dialogMode: PropTypes.oneOf(["add", "edit"]).isRequired,
  formData: PropTypes.shape({
    applicationStep: PropTypes.string,
    applicationStatus: PropTypes.string,
  }).isRequired,
  handleFormChange: PropTypes.func.isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  handleCloseDialog: PropTypes.func.isRequired,
};

export default ApplicationDialog;
