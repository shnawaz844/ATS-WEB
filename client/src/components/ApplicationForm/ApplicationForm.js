import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAddUser } from "../../hooks/useUser";
import {
  FileUp,
  Mail,
  Clock,
  Send,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Lock,
} from "lucide-react";
import emailjs from "@emailjs/browser";
import UserDialog from "../UserDialog";

export const ApplicationForm = ({
  job,
  loginData,
  applicationStatusesData,
  jobStatuses,
}) => {
  const companyUserName = localStorage.getItem("companyUserName");
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  const isRecruiterManager = userRole === "recruiter_manager";
  // State for UserDialog
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [userFormData, setUserFormData] = useState({
    userName: "",
    email: "",
    password: "",
    gender: "",
    address: "",
    role: "candidate", // Default role for application form
    company_id: JSON.parse(localStorage.getItem("user"))?.company_id,
  });

  // Fetch company_id from localStorage (or use the passed prop)
  // Fetch company_id from job first (if available), then localStorage
  const companyId = job?.company_id || JSON.parse(localStorage.getItem("user") || "{}")?.company_id;
  const [emailStatus, setEmailStatus] = useState("");
  const [candidateID, setCandidateID] = useState(null); // Initialize as null
  const { mutate: addUser } = useAddUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      candidateID: "",
      jobID: "",
      applicationId: "",
      resume: null,
      contactInfo: "",
      emailInfo: "",
      experience: "",
      questions: [],
      answers: [],
      companyId: companyId,
    },
  });

  // Initialize EmailJS
  useEffect(() => {
    if (process.env.REACT_APP_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
    }
    console.log("Job", job)
  }, []);

  // Set candidateID based on user role
  useEffect(() => {
    if (loginData) {
      if (isRecruiterManager) {
        // For recruiter manager, candidateID will be set when a new candidate is created
        // or they can select an existing candidate
        setCandidateID(null);
      } else if (loginData.role === "candidate") {
        // For regular candidates, use their own ID
        setCandidateID(loginData._id);
      }
    }
  }, [loginData, isRecruiterManager]);

  // Handle file
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // Set initial application status
  useEffect(() => {
    if (applicationStatusesData?.applicationStatuses?.length) {
      const step1Status = applicationStatusesData.applicationStatuses.find(
        (status) => status.applicationStep === "1",
      );
      if (step1Status) {
        setValue("applicationStatusId", step1Status._id);
      }
    }
  }, [applicationStatusesData, setValue]);

  // Handle UserDialog form changes
  const handleUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCloseDialog = () => {
    setShowUserDialog(false);
  };

  // Handle UserDialog form submission
  const handleUserFormSubmit = (e) => {
    e.preventDefault();
    if (dialogMode === "add") {
      addUser(userFormData, {
        onSuccess: (res) => {
          console.log("New candidate created:", res.data);
          if (res.data) {
            // Set the newly created candidate's ID
            setCandidateID(res.data);
            // Update the email field with the new candidate's email
            setValue("emailInfo", userFormData.email);
          }
          setShowUserDialog(false);
        },
        onError: (error) => {
          console.error("Failed to add user:", error);
        },
      });
    }
  };

  const onSubmit = async (data) => {
    console.log("Form data:", data);

    // Validation checks
    if (isRecruiterManager && !candidateID) {
      alert("Please create or select a candidate first before applying.");
      return;
    }

    if (
      !isRecruiterManager &&
      (!loginData || loginData?.role !== "candidate")
    ) {
      navigate("/login", {
        state: {
          returnUrl: window.location.pathname,
          message: "Please log in to apply for this job",
        },
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare FormData
    const formData = new FormData();
    const jobStatus = jobStatuses?.filter(
      (status) => status.jobStatus === "Filled",
    );
    const step1Status = applicationStatusesData?.applicationStatuses?.find(
      (status) => status.applicationStep === "1",
    );
    const finalCandidateID = isRecruiterManager ? candidateID : loginData._id;

    formData.append("candidateID", finalCandidateID);
    formData.append("candidateName", loginData?.name || ""); // Add candidate name
    formData.append("jobID", job._id);
    formData.append("applicationStatusId", step1Status?._id || "");
    formData.append("jobStatusId", jobStatus.length ? jobStatus[0]._id : job.status);
    formData.append("resume", file);
    formData.append("contactInfo", data.contactInfo);
    formData.append("emailInfo", data.emailInfo);
    formData.append("experience", data.experience);
    formData.append("questions", JSON.stringify(job.applicationForm.question));
    formData.append("answers", JSON.stringify(data.answers));
    formData.append("companyUserName", companyUserName);
    formData.append("company_id", job.company_id);
    formData.append("interviewMode", job.interviewMode);
    if (job.interview_id) {
      formData.append("interview_id", job.interview_id);
    }
    if (job.interviewType) {
      formData.append("interviewType", typeof job.interviewType === 'object' ? job.interviewType.roundId : job.interviewType);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/application/add-application`,
        {
          method: "POST",
          headers: {
            company_id: companyId,
          },
          body: formData,
        },
      );
      const result = await response.json();

      if (response.ok) {
        console.log("✅ Application submitted successfully!");

        setSuccessMessage(
          isRecruiterManager
            ? "Application submitted successfully on behalf of candidate! Confirmation email sent."
            : "Application submitted successfully! Check your email for confirmation.",
        );

        setTimeout(() => {
          navigate(`/${companyUserName}/my-jobs`);
        }, 2500);
      } else {
        console.error("Application submission failed:", result);
        alert(
          `Failed to submit application: ${result.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert(
        "An error occurred while submitting your application. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not logged in as candidate and not recruiter manager, don't render the form
  if (!loginData && !isRecruiterManager) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-purple-50 dark:bg-slate-800/50 rounded-lg text-center border dark:border-slate-700">
        <Lock size={32} className="text-red-600 mb-3" />
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
          Login Required
        </h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Please log in to apply for this position
        </p>
        <button
          onClick={() =>
            navigate(`/${companyUserName}/login`, {
              state: { returnUrl: window.location.pathname },
            })
          }
          className="px-4 py-2 bg-gray-700 dark:bg-slate-600 text-white rounded-xl hover:bg-gray-400 hover:text-black dark:hover:bg-slate-500 transition-colors shadow-sm"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
        <CheckCircle size={32} className="text-green-500 mb-3" />
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
          Application Submitted!
        </h3>
        <p className="text-gray-600 dark:text-slate-300 mb-2">
          {successMessage}
        </p>
        {emailStatus && (
          <p className="text-sm text-purple-600 dark:text-purple-400">
            {emailStatus}
          </p>
        )}
        <p className="text-gray-500 dark:text-slate-500 text-sm mt-2">
          Redirecting to your applications...
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {isRecruiterManager && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-white/5 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800 dark:text-gray-100 mb-2">
                Recruiter Manager Mode
              </h3>
              <p className="text-sm text-purple-600 dark:text-gray-300 mb-3">
                {candidateID
                  ? `Selected Candidate ID: ${candidateID}`
                  : "No candidate selected. Please create a new candidate first."}
              </p>
              <button
                type="button"
                onClick={() => setShowUserDialog(true)}
                className="text-sm bg-purple-600 dark:bg-purple-700 text-white px-3 py-1 rounded hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
              >
                {candidateID
                  ? "Create Another Candidate"
                  : "Create New Candidate"}
              </button>
            </div>
          </div>
        )}

        {/* Application Status - Hidden from UI but still in form data */}
        <input type="hidden" {...register("applicationStatus")} />

        {/* Resume */}
        <div className="space-y-2">
          <label className="flex items-center text-gray-700 dark:text-slate-200 font-medium">
            <FileText size={18} className="mr-2 text-purple-600" />
            Resume
          </label>
          <div className="relative">
            <input
              type="file"
              id="resume"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              required
            />
            <div className="flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-slate-700 border-dashed rounded-md bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400">
              <div className="flex items-center">
                <FileUp size={18} className="mr-2" />
                <span>{file ? file.name : "Upload resume"}</span>
              </div>
              <span className="text-sm text-purple-600">Browse</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500">
            PDF, DOCX, or RTF (Max 5MB)
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <label className="flex items-center text-gray-700 dark:text-slate-200 font-medium">
            <Mail size={18} className="mr-2 text-purple-600" />
            Contact Information
          </label>
          <input
            type="number"
            {...register("contactInfo", { required: true })}
            placeholder="Phone number"
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-slate-800 dark:text-white"
            required
          />
          {errors.contactInfo && (
            <p className="flex items-center text-red-500 text-sm">
              <AlertCircle size={14} className="mr-1" />
              Contact information is required
            </p>
          )}
        </div>

        {/* Email Info */}
        <div className="space-y-2">
          <label className="flex items-center text-gray-700 dark:text-slate-200 font-medium">
            <Mail size={18} className="mr-2 text-purple-600" />
            Email Information
          </label>
          <input
            type="email"
            {...register("emailInfo", { required: true })}
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-slate-800 dark:text-white"
            required
          />
          {errors.emailInfo && (
            <p className="flex items-center text-red-500 text-sm">
              <AlertCircle size={14} className="mr-1" />
              Email information is required
            </p>
          )}
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <label className="flex items-center text-gray-700 dark:text-slate-200 font-medium">
            <Clock size={18} className="mr-2 text-purple-600" />
            Relevant Experience
          </label>
          <textarea
            {...register("experience", { required: true })}
            placeholder="Briefly describe relevant experience for this role"
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-slate-800 dark:text-white"
            rows="4"
            required
          ></textarea>
          {errors.experience && (
            <p className="flex items-center text-red-500 text-sm">
              <AlertCircle size={14} className="mr-1" />
              Experience information is required
            </p>
          )}
        </div>

        {/* Application Questions */}
        {job.applicationForm.question &&
          job.applicationForm.question.length > 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center text-lg font-semibold text-gray-800 dark:text-white pb-2 border-b dark:border-slate-700">
                <User size={18} className="mr-2 text-purple-600" />
                Application Questions
              </h2>
              {job.applicationForm.question.map((question, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-gray-700 dark:text-slate-200 font-medium">
                    {question}
                  </label>
                  <textarea
                    {...register(`answers[${index}]`, { required: true })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-slate-800 dark:text-white"
                    rows="3"
                    required
                  ></textarea>
                  {errors.answers && errors.answers[index] && (
                    <p className="flex items-center text-red-500 text-sm">
                      <AlertCircle size={14} className="mr-1" />
                      This question requires an answer
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* Email Status */}
        {emailStatus && (
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
            <p className="text-purple-700 dark:text-purple-400 text-sm">
              {emailStatus}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || (isRecruiterManager && !candidateID)}
          className={`w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-medium transition duration-200 ${isSubmitting || (isRecruiterManager && !candidateID)
            ? "bg-[#9333ea] dark:from-slate-700 dark:to-slate-900 cursor-not-allowed"
            : "bg-[#9333ea] dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 hover:text-black transform hover:-translate-y-1 shadow-md hover:shadow-lg"
            }`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} className="mr-2" />
              {isRecruiterManager
                ? "Apply on Behalf of Candidate"
                : "Apply Now"}
            </>
          )}
        </button>
      </form>

      {/* User Dialog */}
      {showUserDialog && (
        <UserDialog
          dialogMode={dialogMode}
          formData={userFormData}
          handleFormChange={handleUserFormChange}
          handleFormSubmit={handleUserFormSubmit}
          handleCloseDialog={() => setShowUserDialog(false)}
          loggedInUser={loginData}
          companies={[]}
        />
      )}
    </>
  );
};
