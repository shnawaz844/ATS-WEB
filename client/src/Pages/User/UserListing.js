import React, { useState, useMemo, useEffect } from 'react';
import { useUsers, useAddUser, useUpdateUser, useDeleteUser } from '../../hooks/useUser';
import UserDialog from '../../components/UserDialog';
import { Search, Plus, Edit, MapPin, User, Users, ChevronLeft, ChevronRight, Loader, Trash2 } from 'lucide-react';
import BackButtonMobile from '../../components/Mob-back-btn';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserListing = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    gender: '',
    address: '',
    role: '',
    head: false,
  });
  const [serverErrors, setServerErrors] = useState({});

  const loggedInUser = JSON.parse(localStorage.getItem("user")) // Replace with your auth logic

  const { data: usersData, isLoading, isError, error } = useUsers({
    page: currentPage,
    limit: 9,
    search,
    role: loggedInUser.role === 'super' ? "admin" : null
  });

  const { mutate: addUser } = useAddUser();
  const { mutate: updateUser } = useUpdateUser();
  const { mutate: deleteUser } = useDeleteUser();

  const users = usersData?.users || [];
  const totalPages = usersData?.totalPages || 1;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Function to get company name by company ID
  const getCompanyNameById = (companyId) => {
    if (!companyId || !companies.length) return 'No Company';
    const company = companies.find(comp => comp._id === companyId || comp.id === companyId);
    return company ? company.companyName || company.name : 'Unknown Company';
  };

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      userName: '',
      email: '',
      password: '',
      gender: '',
      address: '',
      role: '',
      head: false,
      company_id: loggedInUser.role === "admin" ? loggedInUser.company_id : '',
    });
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      userName: user.userName || '',
      email: user.email || '',
      password: '',
      gender: user.gender || '',
      address: user.address || '',
      role: user.role || '',
      head: user.head || false,
      company_id: user.company_id || ''
    });
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFormChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
    setServerErrors((prev) => ({
      ...prev,
      [e.target.name]: null,
    }));
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatRole = (role) => {
    if (!role) return '';
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/companies/get`
      )
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.Companies)
      } else {
        setCompanies([])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  useEffect(() => {
    fetchCompanies();
  }, [])

  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(u => u._id === userId);
    if (loggedInUser.role === 'admin' && userToDelete?.role === 'admin') {
      alert('Admin users cannot delete other admin users.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId, {
        onSuccess: () => {
          console.log('User deleted successfully');
        },
        onError: (error) => {
          console.error('Failed to delete user:', error);
        }
      });
    }
  };

  const handleFormSubmit = (e) => {
    // Clean up form data - remove empty address if not provided
    const cleanedFormData = { ...formData };
    if (!cleanedFormData.address?.trim()) {
      delete cleanedFormData.address; // Remove empty address field
    }
    e.preventDefault();
    if (dialogMode === 'add') {
      addUser(formData, {
        onSuccess: () => {
          toast.success('User created successfully!');
          handleCloseDialog();
        },
        onError: (error) => {
          console.error('Failed to add user:', error);
          const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to add user';
          toast.error(errorMsg);
          if (error.response && error.response.data && error.response.data.error) {
            setServerErrors({ email: error.response.data.error });
          }
        },
      });
    } else {
      if (!selectedUser) return;
      const updatedData = { ...formData };
      if (!formData.password) {
        delete updatedData.password;
      }
      updateUser(
        { userId: selectedUser._id, formData: updatedData },
        {
          onSuccess: () => {
            toast.success('User updated successfully!');
            handleCloseDialog();
          },
          onError: (error) => {
            console.error('Failed to update user:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to update user';
            toast.error(errorMsg);
            if (error.response && error.response.data && error.response.data.error) {
              setServerErrors({ email: error.response.data.error });
            }
          },
        }
      );
    }
  }

  // Get role-based badge color
  const getRoleBadgeColor = (role) => {
    if (!role) return 'bg-gray-100 text-gray-800';

    const roleLower = role.toLowerCase();
    if (roleLower.includes('admin')) return 'bg-indigo-100 text-indigo-800';
    if (roleLower.includes('manager')) return 'bg-blue-100 text-blue-800';
    if (roleLower.includes('super')) return 'bg-purple-100 text-purple-800';
    return 'bg-blue-100 text-blue-800';
  };

  console.log("formData", formData);

  return (
    <div className="sm:px-8 sm:py-4 py-2 px-2 w-full min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <BackButtonMobile />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className='mb-6 h-auto min-h-[15vh] flex flex-col sm:flex-row items-center justify-between rounded-xl p-4 sm:p-6 backdrop-blur-xl bg-gray-200 dark:bg-transparent dark:border border-gray-600  shadow-sm gap-4 sm:gap-0'>
          <div className="flex items-center w-full sm:w-auto gap-4">
            <div className="p-3 bg-[#9333ea]/10 rounded-full">
              <Users className="h-6 w-6 text-[#9333ea] dark:text-[#9333ea]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-[20vw] min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#9333ea] focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <button
              onClick={handleOpenAddDialog}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-[#9333ea] text-white rounded-xl hover:bg-[#7e22ce] transition-colors duration-200 whitespace-nowrap shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="font-medium">Add User</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 text-[#9333ea] animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 my-6">
            <p className="text-red-600 dark:text-red-400 flex items-center">
              <span className="mr-2">⚠️</span>
              Error: {error.message}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="backdrop-blur-xl bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#9333ea]/50 dark:hover:border-[#9333ea]/50 hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-br from-[#9333ea] to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">{capitalizeFirstLetter(user.userName)}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{getCompanyNameById(user.company_id)}</p>

                      </div>

                    </div>
                    <div className='flex gap-1 sm:gap-2'>
                      <button
                        onClick={() => handleOpenEditDialog(user)}
                        className="sm:p-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors "
                        aria-label="Edit user"
                      >
                        <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      {!(loggedInUser?.role === 'admin' && user.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="sm:p-2 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                        </button>
                      )}
                    </div>

                  </div>

                  <div className="sm:mt-4 mt-3 flex flex-wrap gap-1 sm:gap-2">
                    {user.role && (
                      <span className={`sm:px-3 px-2 py-1 text-xs sm:text-sm rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                    )}

                    {user.head && (
                      <span className="sm:px-3 px-2 py-1 text-xs sm:text-sm rounded-full bg-emerald-100 text-emerald-800 font-medium">
                        Head
                      </span>
                    )}

                    {user.gender && (
                      <span className="sm:px-3 px-2 py-1 text-xs sm:text-sm rounded-full bg-pink-100 text-pink-800 font-medium">
                        {capitalizeFirstLetter(user.gender)}
                      </span>
                    )}
                  </div>

                  {user.address && (
                    <p className="sm:px-3 px-2 py-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <MapPin className="sm:h-4 h-3 w-3 sm:w-4 mr-1 text-gray-400 dark:text-gray-500" />
                      {user.address}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Empty state */}
            {users.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <User className="sm:h-16 h-12 sm:w-16 w-12 text-gray-300 dark:text-gray-600 sm:mb-4 mb-3" />
                <h3 className="sm:text-lg text-base font-medium text-gray-900 dark:text-white mb-1">No users found</h3>
                <p className="sm:text-lg text-base text-gray-500 dark:text-gray-400 sm:mb-4 mb-3">Try adjusting your search or add a new user</p>
                <button
                  onClick={handleOpenAddDialog}
                  className="sm:px-4 px-3 sm:py-2 py-1 bg-[#9333ea] text-white rounded-xl hover:bg-[#7e22ce] transition-colors text-sm sm:text-base"
                >
                  <Plus className="sm:h-4 h-3 sm:w-4 w-3 inline sm:mr-2 mr-1" />
                  Add User
                </button>
              </div>
            )}

            {/* Pagination */}
            {users.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mt-3 sm:mt-4 gap-3 sm:gap-0">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className={`flex items-center px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-lg border ${currentPage <= 1
                    ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed rounded-xl'
                    : 'bg-gray-700 dark:bg-gray-800 text-white border-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 rounded-xl'
                    }`}
                >
                  <ChevronLeft className="sm:h-4 h-3 sm:w-4 w-3 mr-1" />
                  Previous
                </button>

                <div className="flex items-center">
                  <span className="sm:px-3 px-4 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-medium rounded-xl">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className={`flex items-center px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-lg border ${currentPage >= totalPages
                    ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed rounded-xl'
                    : 'bg-gray-700 dark:bg-gray-800 text-white border-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 rounded-xl'
                    }`}
                >
                  Next
                  <ChevronRight className="sm:h-4 h-3 sm:w-4 w-3 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isDialogOpen && (
        <UserDialog
          dialogMode={dialogMode}
          formData={formData}
          handleFormChange={handleFormChange}
          handleFormSubmit={handleFormSubmit}
          handleCloseDialog={handleCloseDialog}
          isOpen={isDialogOpen}
          loggedInUser={loggedInUser}
          companies={companies}
          serverErrors={serverErrors}
        />
      )}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default UserListing;