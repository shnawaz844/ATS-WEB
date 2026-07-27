import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

const ShortlistedApplications = ({ email }) => {
  const { theme } = useTheme();
  const [shortlistedData, setShortlistedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const interviewTypes = ["online", "walkin"];
  const [editForm, setEditForm] = useState({
    time: "",
    date: "",
    interviewType: "",
    meetingLink: ""
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (interview) => {
    setEditingId(interview.jobId); // Use jobId for editing
    setEditForm({
      time: interview.time || "",
      date: interview.date || "",
      interviewType: interview.interviewType || "",
      meetingLink: interview.meetingLink || ""
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    setInterviews(interviews.map(interview =>
      interview.jobId === editingId
        ? { ...interview, ...editForm }
        : interview
    ));
    setIsEditModalOpen(false);
    setEditingId(null);
  };

  useEffect(() => {
    const fetchShortlistedApplications = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/application/get-application-hm/${email}`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // Parse JSON
        const result = await response.json();
        setShortlistedData(result.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch shortlisted applications');
      } finally {
        setLoading(false);
      }
    };

    fetchShortlistedApplications();
  }, [email]);
  console.log("fetchShortlistedApplications", setShortlistedData)

  if (loading) {
    return <p className="text-center mt-4">Loading...</p>;
  }

  if (error) {
    return <p className="text-center mt-4 text-red-600">{error}</p>;
  }

  // Dummy data to display when there are no shortlisted applications
  const dummyData = [
    { jobId: 1, title: "Dummy Job 1", location: "Remote", type: "Full-time", schedule: "Flexible", shift: "Day", compensation: "$60,000" },
    { jobId: 2, title: "Dummy Job 2", location: "New York", type: "Part-time", schedule: "9 AM - 5 PM", shift: "Day", compensation: "$30,000" },
  ];

  const applicationsToDisplay = shortlistedData.length === 0 ? dummyData : shortlistedData;

  return (
    <div className={`container mx-auto px-4 py-6 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Shortlisted Applications</h2>
      <div className="overflow-x-auto">
        <table className={`min-w-full border shadow-md rounded transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <thead>
            <tr>
              <th className={`py-3 px-4 border-b text-left ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>Job Title</th>
              <th className={`py-3 px-4 border-b text-left ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>Location</th>
              <th className={`py-3 px-4 border-b text-left ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>Type</th>
              <th className={`py-3 px-4 border-b text-left ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>Schedule</th>
              <th className={`py-3 px-4 border-b text-left ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>Shift</th>
              <th className={`py-3 px-4 border-b text-left ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>Compensation</th>
              <th className={`py-3 px-4 border-b text-left ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {applicationsToDisplay.map((application) => {
              const { jobId, title, location, type, schedule, shift, compensation } = application;

              return (
                <tr key={jobId} className={`transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`py-3 px-4 border-b ${theme === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-900'}`}>{title || 'N/A'}</td>
                  <td className={`py-3 px-4 border-b ${theme === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-900'}`}>{location || 'N/A'}</td>
                  <td className={`py-3 px-4 border-b ${theme === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-900'}`}>{type || 'N/A'}</td>
                  <td className={`py-3 px-4 border-b ${theme === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-900'}`}>{schedule || 'N/A'}</td>
                  <td className={`py-3 px-4 border-b ${theme === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-900'}`}>{shift || 'N/A'}</td>
                  <td className={`py-3 px-4 border-b ${theme === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-900'}`}>{compensation || 'N/A'}</td>
                  <td className={`py-3 px-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => handleEdit(application)} // Pass the application for editing
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Fix Appointment
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Interview Details</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className={`transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Time</label>
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Interview Type</label>
                <select
                  value={editForm.interviewType}
                  onChange={(e) => setEditForm({ ...editForm, interviewType: e.target.value })}
                  className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  {interviewTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Meeting Link</label>
                <input
                  type="url"
                  value={editForm.meetingLink}
                  onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                  className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortlistedApplications;

