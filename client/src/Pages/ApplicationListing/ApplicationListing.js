import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, Link as LinkIcon, X } from 'lucide-react';

const ApplicationList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [selectedJobField, setSelectedJobField] = useState("All");
  const [detailedApplication, setDetailedApplication] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    interviewType: 'technical',
    meetingLink: ''
  });

  const hiringManagerEmail = "hassan123@gmail.com";
  const interviewTypes = ['technical', 'hr', 'cultural-fit', 'system-design'];

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/application/get-application-hm/${hiringManagerEmail}`);
        if (!response.ok) throw new Error("API not available");
        const data = await response.json();
        setApplications(Array.isArray(data) ? data : []);
        setTotalPages(1);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    fetchApplications();
  }, [page, search]);

  const jobFields = ["All", ...new Set(applications.map(app => app.jobDetails?.title || "Unknown"))];

  const filteredApplications = applications.filter(app =>
    (selectedJobField === "All" || app.jobDetails?.title === selectedJobField) &&
    (search === "" || app.applicationStatus.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApplicationClick = (application) => {
    setDetailedApplication(application);
    setIsModalOpen(true);
  };

  const handleScheduleInterview = async () => {
    try {
      // API call to schedule interview would go here
      const interviewData = {
        applicationId: detailedApplication._id,
        ...interviewForm
      };
      console.log('Scheduling interview:', interviewData);
      // Close modal after successful scheduling
      setIsModalOpen(false);
      setInterviewForm({
        date: '',
        time: '',
        interviewType: 'technical',
        meetingLink: ''
      });
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };

  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        default: 'bg-blue-100 text-blue-800'
      };
      return colors[status.toLowerCase()] || colors.default;
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Application List</h1>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by Status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
            />
            <select
              className="w-48 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedJobField}
              onChange={(e) => setSelectedJobField(e.target.value)}
            >
              {jobFields.map((field, index) => (
                <option key={index} value={field}>{field}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app) => (
            <div
              key={app._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => handleApplicationClick(app)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{app.jobDetails?.title || "N/A"}</h3>
                <StatusBadge status={app.applicationStatus || "N/A"} />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Applicant:</span> {app.candidateDetails.userName || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Experience:</span> {app.experience || "N/A"} years
                </p>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Job Details</h3>
                    <p className="text-lg font-semibold">{detailedApplication?.jobDetails?.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Applicant Name</h3>
                    <p className="text-lg">{detailedApplication?.candidateDetails.userName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contact Info</h3>
                    <p className="text-lg">{detailedApplication?.contactInfo}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <StatusBadge status={detailedApplication?.applicationStatus} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                    <p className="text-lg">{detailedApplication?.experience} years</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Resume</h3>
                    <a
                      href={detailedApplication?.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Resume
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold mb-4">Schedule Interview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={interviewForm.date}
                        onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                        className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="time"
                        value={interviewForm.time}
                        onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                        className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
                    <div className="relative">
                      <Video className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <select
                        value={interviewForm.interviewType}
                        onChange={(e) => setInterviewForm({ ...interviewForm, interviewType: e.target.value })}
                        className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      >
                        {interviewTypes.map(type => (
                          <option key={type} value={type}>
                            {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={interviewForm.meetingLink}
                        onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                        className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleInterview}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Schedule Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationList;