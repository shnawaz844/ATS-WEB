import React, { useState, useMemo, useEffect } from 'react';
import { useUsers, useAddUser, useUpdateUser } from '../../hooks/useUser';
import UserDialog from '../../components/UserDialog';
import { Search, Plus, Edit, MapPin, User, Users, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

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

  const loggedInUser = JSON.parse(localStorage.getItem("user")) // Replace with your auth logic

  const { data: usersData, isLoading, isError, error } = useUsers({
    page: currentPage,
    limit: 9,
    search,
    role: loggedInUser.role === 'super' ? "admin" : null
  });

  const { mutate: addUser } = useAddUser();
  const { mutate: updateUser } = useUpdateUser();

  const users = usersData?.users || [];
  const totalPages = usersData?.totalPages || 1;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
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
        `${ process.env.REACT_APP_BASE_URL }/companies/get`
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (dialogMode === 'add') {
      addUser(formData, {
        onSuccess: () => {
          handleCloseDialog();
        },
        onError: (error) => {
          console.error('Failed to add user:', error);
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
            handleCloseDialog();
          },
          onError: (error) => {
            console.error('Failed to update user:', error);
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
    <div className="px-8 py-4 w-full min-h-screen"
      style={ { background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' } }
    >
      <div className="max-w-screen-2xl">
        <div className='mb-6 h-[15vh] flex items-center rounded-xl p-4 bg-gray-700'>
          <div className="flex items-center w-full gap-4">
            <Users className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white">User Management</h1>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={handleSearchChange}
                className="w-[20vw] pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <button
              onClick={handleOpenAddDialog}
              className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 hover:text-white border border-white transition-colors duration-200 whitespace-nowrap shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="font-medium">Add User</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 my-6">
            <p className="text-red-600 flex items-center">
              <span className="mr-2">⚠️</span>
              Error: {error.message}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-white p-5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{ capitalizeFirstLetter(user.userName)}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenEditDialog(user)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Edit user"
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.role && (
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                    )}

                    {user.head && (
                      <span className="px-3 py-1 text-sm rounded-full bg-emerald-100 text-emerald-800 font-medium">
                        Head
                      </span>
                    )}

                    {user.gender && (
                      <span className="px-3 py-1 text-sm rounded-full bg-pink-100 text-pink-800 font-medium">
                        {capitalizeFirstLetter(user.gender)}
                      </span>
                    )}
                  </div>

                  {user.address && (
                    <p className="mt-3 text-sm text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {user.address}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Empty state */}
            {users.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or add a new user</p>
                <button
                  onClick={handleOpenAddDialog}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add User
                </button>
              </div>
            )}

            {/* Pagination */}
            {users.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className={`flex items-center px-4 py-2 text-sm rounded-lg border ${currentPage <= 1
                    ? 'bg-gray-400 text-white border-gray-200 cursor-not-allowed rounded-xl'
                    : 'bg-gray-700 text-white border-gray-300 hover:bg-gray-400 rounded-xl'
                    }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center">
                  <span className="px-3 py-1 text-sm bg-gray-200 text-black font-medium rounded-xl">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className={`flex items-center px-4 py-2 text-sm rounded-lg border ${currentPage >= totalPages
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed rounded-xl'
                    : 'bg-gray-700 text-white border-gray-300 hover:bg-gray-400 rounded-xl'
                    }`}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
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
        />
      )}
    </div>
  );
};

export default UserListing;