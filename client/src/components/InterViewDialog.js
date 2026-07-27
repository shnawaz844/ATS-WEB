import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../context/ThemeContext";

const InterViewDialog = ({
  dialogMode,
  formData,
  handleFormChange,
  handleFormSubmit,
  handleCloseDialog,
}) => {
  const { theme } = useTheme();

  // Close the dialog when clicking outside (on the overlay)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseDialog();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-md transform transition-all bg-white dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
          <h2 className="text-[1.5rem] font-semibold text-gray-800 dark:text-white">
            {dialogMode === "add" ? "Add Interview Round" : "Edit Interview Round"}
          </h2>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Round Number
              </label>
              <input
                type="text"
                name="roundNumber"
                value={formData.roundNumber}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9333ea] focus:border-[#9333ea] outline-none transition-colors border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Round Name
              </label>
              <input
                type="text"
                name="roundName"
                value={formData.roundName}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9333ea] focus:border-[#9333ea] outline-none transition-colors border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCloseDialog}
              className="px-4 py-2 text-sm font-medium border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9333ea] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9333ea] bg-[#9333ea] hover:bg-[#7e22ce]"
            >
              {dialogMode === "add" ? "Add" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

InterViewDialog.propTypes = {
  dialogMode: PropTypes.oneOf(["add", "edit"]).isRequired,
  formData: PropTypes.shape({
    roundName: PropTypes.string,
    roundNumber: PropTypes.string,
  }).isRequired,
  handleFormChange: PropTypes.func.isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  handleCloseDialog: PropTypes.func.isRequired,
};

export default InterViewDialog;


