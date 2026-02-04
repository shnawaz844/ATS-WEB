import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const UserDialog = ({
    handleCloseDialog,
    dialogMode,
    formData,
    handleFormChange,
    handleFormSubmit,
    loggedInUser,
    companies
}) => {
    const { theme } = useTheme();
    const userRole = JSON.parse(localStorage.getItem('user')).role;
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);


    // Function to validate the form fields
    const validateForm = () => {
        const newErrors = {};
        if (!formData.userName || formData.userName.trim() === '') {
            newErrors.userName = 'User Name is required';
        }
        if (!formData.email || formData.email.trim() === '') {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (dialogMode === 'add' && (!formData.password || formData.password.trim() === '')) {
            newErrors.password = 'Password is required';
        }
        // Add additional validations if needed (e.g., for gender, address, etc.)
        return newErrors;
    };

    // Updated submit handler that performs validation
    const onSubmit = (e) => {
        e.preventDefault();
        console.log('eeeeeeeee', e);
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
        } else {
            setErrors({});
            handleFormSubmit(e);
        }
    };

    // Close the dialog when clicking outside (on the overlay)
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCloseDialog();
        }
    };

    console.log("userRole", userRole);

    return (
        <div
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300 mt-11"
        >

            <div
                className="rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 bg-white dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <div className="relative flex justify-center items-center p-5 border-b rounded-t-xl bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        {dialogMode === 'add' ? 'Add New User' : 'Edit User Details'}
                    </h2>
                    <button
                        onClick={handleCloseDialog}
                        className="absolute right-4 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1 transition-all duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="max-h-[calc(90vh-150px)] overflow-y-auto">
                    <form onSubmit={onSubmit} autoComplete='off' className="p-6 space-y-6">
                        <div className="space-y-4">
                            {/* User Name Field */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    User Name
                                </label>
                                <input
                                    type="text"
                                    name="user_name"
                                    autoComplete='new-username'
                                    value={formData.userName}
                                    onChange={(e) => handleFormChange({ target: { name: 'userName', value: e.target.value } })}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9333ea] focus:border-[#9333ea] outline-none transition-colors border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                {errors.userName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9333ea] focus:border-[#9333ea] outline-none transition-colors border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field (only in 'add' mode) */}
                            {dialogMode === 'add' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="user_pass"
                                            autoComplete='new-password'
                                            value={formData.password || ''}
                                            onChange={(e) => handleFormChange({ target: { name: 'password', value: e.target.value } })}
                                            required
                                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9333ea] focus:border-[#9333ea] outline-none transition-colors border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                    )}
                                </div>
                            )}

                            {/* Gender Field */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleFormChange}
                                    className="sm:w-full w-40 px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9333ea] focus:border-[#9333ea] outline-none transition-colors border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="non-binary">Non-Binary</option>
                                </select>
                            </div>

                            {/* Address Field */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9333ea] focus:border-[#9333ea] outline-none transition-colors border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Company Dropdown (visible for super users) */}
                            {loggedInUser.role === 'super' && (
                                <div className="mb-4">
                                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Company
                                    </label>
                                    <select
                                        id="company"
                                        name="company_id"
                                        value={formData.company_id || ''}
                                        onChange={handleFormChange}
                                        className="mt-1 block w-full rounded-md shadow-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[#9333ea] focus:border-[#9333ea]"
                                    >
                                        <option value="">Select a company</option>
                                        {companies?.map((company) => (
                                            <option key={company._id} value={company._id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Role Field */}
                            {loggedInUser.role === 'super' ? (
                                <>
                                    <input type="hidden" name="role" value={formData.role = "admin"} />
                                    <p className="mb-4 text-gray-700 dark:text-gray-300">Role: Admin</p>
                                </>
                            ) : loggedInUser.role === 'recruiter_manager' ? (
                                <>
                                    <input type="hidden" name="role" value={formData.role = "candidate"} />
                                    <p className="mb-4 text-gray-700 dark:text-gray-300">Role: Candidate</p>
                                </>
                            ) : (
                                <div className="mb-4">
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleFormChange}
                                        className="mt-1 block sm:w-full w-32 rounded-md shadow-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[#9333ea] focus:border-[#9333ea]"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="recruiter_manager">Recruiter Manager</option>
                                        <option value="hiring_manager">Hiring Manager</option>
                                        <option value="interviewer">Interviewer</option>
                                        <option value="candidate">Candidate</option>
                                    </select>
                                </div>
                            )}

                            {/* Conditional checkbox for recruiter_manager */}
                            {formData.role === 'recruiter_manager' && (
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="head"
                                        checked={formData.head || false}
                                        onChange={handleFormChange}
                                        className="h-4 w-4 text-[#9333ea] focus:ring-[#9333ea] border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Are you a head?
                                    </label>
                                </div>
                            )}
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
                                {dialogMode === 'add' ? 'Add User' : 'Update User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    );
};

UserDialog.propTypes = {
    dialogMode: PropTypes.oneOf(['add', 'edit']).isRequired,
    formData: PropTypes.shape({
        userName: PropTypes.string,
        email: PropTypes.string,
        password: PropTypes.string,
        gender: PropTypes.string,
        address: PropTypes.string,
        role: PropTypes.string,
        head: PropTypes.bool,
        company_id: PropTypes.string,
    }).isRequired,
    handleFormChange: PropTypes.func.isRequired,
    handleFormSubmit: PropTypes.func.isRequired,
    handleCloseDialog: PropTypes.func.isRequired,
    loggedInUser: PropTypes.object.isRequired,
    companies: PropTypes.array,
};

export default UserDialog;
