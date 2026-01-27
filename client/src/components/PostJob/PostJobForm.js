import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Country, State, City } from "country-state-city";
import TimePicker from "react-time-picker";
import ReactQuill from "react-quill";
import CandidateForm from "./CandidateForm";
import "react-quill/dist/quill.snow.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import BackButtonMobile from "../Mob-back-btn";
import { useTheme } from "../../context/ThemeContext";

const capitalizeFirstLetter = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};

const FormField = ({ label, error, children }) => {
  const { theme } = useTheme();
  return (
    <div className="space-y-1">
      <label
        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
      >
        {label}
      </label>
      {children}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

const FormInput = ({
  label,
  register,
  name,
  type = "text",
  error,
  placeholder,
  options,
  ...props
}) => {
  const { theme } = useTheme();
  const inputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors 
    ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`;

  return (
    <FormField label={label} error={error}>
      {type === "select" ? (
        <select {...register(name)} className={inputClasses} {...props}>
          <option
            value=""
            disabled
            className={theme === "dark" ? "text-gray-400" : "text-gray-500"}
          >
            Select {label.toLowerCase()}
          </option>
          {options?.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          {...register(name)}
          className={inputClasses}
          placeholder={placeholder}
          {...props}
        />
      )}
    </FormField>
  );
};

const LocationPicker = ({
  selectedCountry,
  setSelectedCountry,
  selectedState,
  setSelectedState,
  selectedCity,
  setSelectedCity,
  errors,
  jobToEdit,
}) => {
  const countries = Country.getAllCountries();

  // Get the current country code (either from jobToEdit or selectedCountry)
  const currentCountryCode =
    countries.find((c) => c.name === jobToEdit?.country)?.isoCode ||
    selectedCountry;

  // Get states based on current country
  const states = currentCountryCode
    ? State.getStatesOfCountry(currentCountryCode)
    : [];

  // Get the current state code (either from jobToEdit or selectedState)
  const currentStateCode =
    states.find((s) => s.name === jobToEdit?.state)?.isoCode || selectedState;

  // Get cities based on current country and state
  const cities = currentStateCode
    ? City.getCitiesOfState(currentCountryCode, currentStateCode)
    : [];

  const { theme } = useTheme();
  const selectClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors 
    ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`;

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    console.log("Selected City: ", cityName);
  };

  return (
    <div className="space-y-4">
      <FormField label="Country" error={errors?.country}>
        <select
          value={currentCountryCode}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setSelectedState("");
            setSelectedCity("");
          }}
          className={selectClasses}
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="State" error={errors?.state}>
        <select
          value={currentStateCode}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedCity("");
          }}
          className={selectClasses}
          disabled={!currentCountryCode}
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.isoCode}>
              {state.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="City" error={errors?.city}>
        <select
          value={jobToEdit?.city || selectedCity}
          onChange={handleCityChange}
          className={selectClasses}
          disabled={!currentStateCode}
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </FormField>
    </div>
  );
};

const ShiftPicker = ({
  shiftStart,
  setShiftStart,
  shiftEnd,
  setShiftEnd,
  errors,
}) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField label="Shift Start" error={errors?.shiftStart}>
      <TimePicker
        onChange={setShiftStart}
        value={shiftStart}
        disableClock={true}
        format="hh:mm a"
        className="w-full"
      />
    </FormField>
    <FormField label="Shift End" error={errors?.shiftEnd}>
      <TimePicker
        onChange={setShiftEnd}
        value={shiftEnd}
        disableClock={true}
        format="hh:mm a"
        className="w-full"
      />
    </FormField>
  </div>
);

// Title Code Preview Component
const TitleCodePreview = ({ title, existingJobs }) => {
  const [previewCode, setPreviewCode] = useState("");

  useEffect(() => {
    if (title && title.length > 0) {
      // Generate preview without making API call
      const generatePreview = () => {
        const cleanTitle = title
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .replace(/\s+/g, " ")
          .trim();

        const words = cleanTitle.split(" ");
        let titleAbbr = "";

        if (words.length === 1) {
          titleAbbr = words[0].substring(0, 4).toUpperCase();
        } else if (words.length === 2) {
          titleAbbr = words
            .map((word) => word.substring(0, 2))
            .join("")
            .toUpperCase();
        } else {
          titleAbbr = words
            .slice(0, 3)
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase();
        }

        const now = new Date();
        const timestamp = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

        // Estimate sequence (this will be calculated accurately on backend)
        const estimatedSequence = "001";

        setPreviewCode(`${titleAbbr}-${estimatedSequence}-${timestamp}`);
      };

      generatePreview();
    } else {
      setPreviewCode("");
    }
  }, [title, existingJobs]);

  if (!previewCode) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
      <p className="text-sm text-blue-800 font-medium">
        Title Code Preview: <span className="font-mono">{previewCode}</span>
      </p>
      <p className="text-xs text-blue-600 mt-1">
        This code will be generated automatically when you submit the form
      </p>
    </div>
  );
};

export const PostJobForm = ({
  jobToEdit,
  handleSubmit,
  onSubmit,
  errors,
  register,
  control,
  setValue,
  watch,
  shiftStart,
  setShiftStart,
  shiftEnd,
  setShiftEnd,
  questions,
  setQuestions,
  addQuestion,
  handleDeleteQuestion,
  selectedCountry,
  setSelectedCountry,
  selectedState,
  setSelectedState,
  selectedCity,
  setSelectedCity,
  recruiterRole,
  hiringManagersList,
  jobStatus,
  setJobStatus,
  interviewMode,
  setInterviewMode,
  interviewRounds,
}) => {
  const { theme } = useTheme();
  const [isHead, setIsHead] = React.useState(false);
  const [recruitersList, setRecruitersList] = useState([]);
  const [existingJobs, setExistingJobs] = useState([]);
  const [titleCode, setTitleCode] = useState(jobToEdit?.titleCode || "");
  const companyId = JSON.parse(localStorage.getItem("user")).company_id;
  const [jobStatuses, setJobStatuses] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const FORM_OPTIONS = {
    location: [
      { value: "Remote", label: "Remote" },
      { value: "On-site", label: "On-site" },
      { value: "Hybrid", label: "Hybrid" },
    ],
    employment: [
      { value: "Full-Time", label: "Full-Time" },
      { value: "Part-Time", label: "Part-Time" },
      { value: "Contract", label: "Contract" },
    ],
    schedule: [
      { value: "Flexible", label: "Flexible" },
      { value: "Morning Shift", label: "Morning Shift" },
      { value: "Day Shift", label: "Day Shift" },
      { value: "Night Shift", label: "Night Shift" },
    ],
    hire: [
      { value: "New", label: "New" },
      { value: "Replacement", label: "Replacement" },
    ],
    interviewDurations: [
      { value: "5 mins", label: "5 mins" },
      { value: "10 mins", label: "10 mins" },
      { value: "15 mins", label: "15 mins" },
      { value: "20 mins", label: "20 mins" },
      { value: "25 mins", label: "25 mins" },
      { value: "30 mins", label: "30 mins" },
    ],
    interviewTypes:
      interviewRounds?.map((round) => ({
        value: round._id,
        label: round.roundName,
      })) || [],
  };

  const handleGenerateDescription = async () => {
    const jobTitle = watch("title");
    if (!jobTitle) {
      alert("Please enter a clean job title first"); // Using alert as toast is not imported here, or I should check if toast is waiting parent? PostJob has toast. PostJobForm doesn't seem to import toast.
      // Wait, PostJobForm doesn't import toast. I'll just use native alert or console for now, or assume toast is available if I import it.
      // Let's check imports. PostJobForm imports React, Controller, etc. No toast.
      // I'll stick to alert or just simple UI feedback.
      return;
    }

    setIsGeneratingAI(true);
    // Clear existing description before starting stream
    setValue("description", "");

    try {
      const companyUserName = localStorage.getItem("companyUserName");
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/ai/generate-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobTitle, companyUserName }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to generate description");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let cumulativeText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        cumulativeText += chunkText;

        // Update form value incrementally
        setValue("description", cumulativeText);
      }
    } catch (error) {
      console.error("Error generating description:", error);
      alert(`Error generating description: ${error.message}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const descriptionValue = watch("description");

  useEffect(() => {
    if (isGeneratingAI) {
      const editor = document.querySelector(
        "#ai-description-editor .ql-editor",
      );
      if (editor && editor.lastElementChild) {
        editor.lastElementChild.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }
  }, [descriptionValue, isGeneratingAI]);

  useEffect(() => {
    console.log("Recruiter Role in useEffect:", recruiterRole);
    if (recruiterRole === true) {
      setIsHead(true);
    } else {
      setIsHead(false);
    }
  }, [recruiterRole]);

  // Fetch existing jobs for title code generation
  useEffect(() => {
    const fetchExistingJobs = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/jobs/all-jobs`,
          {
            headers: {
              company_id: companyId,
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          setExistingJobs(data.jobs);
        }
      } catch (error) {
        console.error("Error fetching existing jobs:", error);
      }
    };

    fetchExistingJobs();
  }, [companyId]);

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/recruiter/all-recruiter`,
          {
            headers: {
              company_id: companyId,
            },
          },
        );
        const data = await response.json();
        setRecruitersList(data);
      } catch (error) {
        console.error("Error fetching recruiters:", error);
      }
    };

    fetchRecruiters();
  }, []);

  useEffect(() => {
    const fetchJobStatuses = async () => {
      setLoadingStatuses(true);
      setStatusError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/job-statuses/all-job-statuses`,
          {
            headers: {
              company_id: companyId,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job statuses");
        }

        const data = await response.json();
        console.log("Job Statuses API Response:", data);

        if (data.jobStatuses && Array.isArray(data.jobStatuses)) {
          setJobStatuses(data.jobStatuses);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        console.error("Error fetching job statuses:", error);
        setStatusError(error.message);
        setJobStatuses([]);
      } finally {
        setLoadingStatuses(false);
      }
    };

    fetchJobStatuses();
  }, [companyId]);

  const statusOptions = Array.isArray(jobStatuses)
    ? jobStatuses
        .sort((a, b) => parseInt(a.jobStep) - parseInt(b.jobStep))
        .map((status) => ({
          value: status._id,
          label: status.jobStatus,
        }))
    : [];

  // Enhanced onSubmit to handle title code
  const enhancedOnSubmit = async (data) => {
    try {
      // Add title code to data if it's a new job
      if (!jobToEdit) {
        data.titleCode = titleCode;
      }

      // Call the original onSubmit function
      await onSubmit(data);
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  return (
    <div
      className={`min-h-screen py-12 ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}
    >
      <BackButtonMobile />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1
            className={`text-3xl font-bold text-center mb-8 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            {jobToEdit ? "Edit Job Posting" : "Create New Job Posting"}
          </h1>

          <div
            className={`rounded-2xl shadow-xl overflow-hidden ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white"}`}
          >
            <form
              onSubmit={handleSubmit(enhancedOnSubmit)}
              className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8"
            >
              <div className="space-y-4 sm:space-y-6">
                <div
                  className={`border-b pb-3 sm:pb-4 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                >
                  <h2
                    className={`text-lg sm:text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    Job Details
                  </h2>
                  <p
                    className={`mt-1 text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Fill in the basic information about the position.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <FormInput
                      label={capitalizeFirstLetter("Title")}
                      register={register}
                      name="title"
                      error={errors?.title}
                      placeholder="Ex: Software Engineer"
                    />
                    <TitleCodePreview
                      title={watch?.title}
                      existingJobs={existingJobs}
                    />
                  </div>

                  {jobToEdit && (
                    <FormField label="Title Code">
                      <input
                        type="text"
                        value={jobToEdit.titleCode}
                        className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-100 border-gray-300 text-gray-500"}`}
                        disabled
                      />
                      <p
                        className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Title code cannot be changed for existing jobs
                      </p>
                    </FormField>
                  )}

                  <FormInput
                    label="Location Type"
                    register={register}
                    name="locationType"
                    type="select"
                    options={FORM_OPTIONS.location}
                    error={errors?.locationType}
                  />

                  <FormInput
                    label="Employment Type"
                    register={register}
                    name="type"
                    type="select"
                    options={FORM_OPTIONS.employment}
                    error={errors?.type}
                  />

                  <FormInput
                    label="Schedule Type"
                    register={register}
                    name="scheduleType"
                    type="select"
                    options={FORM_OPTIONS.schedule}
                    error={errors?.scheduleType}
                  />

                  <ShiftPicker
                    shiftStart={shiftStart}
                    setShiftStart={setShiftStart}
                    shiftEnd={shiftEnd}
                    setShiftEnd={setShiftEnd}
                    errors={errors}
                  />

                  <FormInput
                    label="Hire Type"
                    register={register}
                    name="hireType"
                    type="select"
                    options={FORM_OPTIONS.hire}
                    error={errors?.hireType}
                  />

                  <FormInput
                    label="Compensation"
                    register={register}
                    name="compensation"
                    error={errors?.compensation}
                    placeholder="Ex: 50000"
                  />

                  <FormInput
                    label="Experience Required (years)"
                    register={register}
                    name="experienceRequired"
                    error={errors?.experienceRequired}
                    placeholder="Ex: 3"
                  />

                  <FormInput
                    label="Required Number of Resources"
                    register={register}
                    name="requiredResources"
                    type="number"
                    error={errors?.requiredResources}
                    placeholder="Ex: 5"
                  />

                  {/* Fixed Status Field */}
                  <FormField
                    label="Status"
                    error={errors?.status || statusError}
                  >
                    <select
                      value={jobStatus}
                      {...register("status", {
                        required: "Status is required",
                      })}
                      onChange={(e) => setJobStatus(e.target.value)}
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                      disabled={loadingStatuses}
                    >
                      <option value="">Select Status</option>
                      {loadingStatuses ? (
                        <option>Loading statuses...</option>
                      ) : statusOptions && statusOptions.length > 0 ? (
                        statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))
                      ) : (
                        <option disabled>No statuses available</option>
                      )}
                    </select>
                  </FormField>

                  {/* Conditional Recruiter Name Field */}
                  {isHead && (
                    <FormField label="Recruiter" error={errors?.recruiterId}>
                      <select
                        value={jobToEdit?.recruiterId}
                        {...register("recruiterId")}
                        className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                      >
                        <option value="">Select Recruiter</option>
                        {recruitersList && recruitersList.length > 0 ? (
                          recruitersList.map((recruiter) => (
                            <option key={recruiter._id} value={recruiter._id}>
                              {recruiter.userName}
                            </option>
                          ))
                        ) : (
                          <option disabled>No recruiters found</option>
                        )}
                      </select>
                    </FormField>
                  )}

                  <FormField
                    label="Hiring Manager"
                    error={errors?.hiringManagerId}
                  >
                    <select
                      value={jobToEdit?.hiringManagerId}
                      {...register("hiringManagerId", {
                        required: "Hiring Manager is required",
                      })}
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    >
                      <option value="">Select Hiring Manager</option>
                      {hiringManagersList && hiringManagersList.length > 0 ? (
                        hiringManagersList.map((manager) => (
                          <option key={manager._id} value={manager._id}>
                            {manager.userName}
                          </option>
                        ))
                      ) : (
                        <option disabled>No hiring managers found</option>
                      )}
                    </select>
                  </FormField>

                  <FormField
                    label="Interview Mode"
                    error={errors?.interviewMode}
                  >
                    <select
                      value={interviewMode}
                      {...register("interviewMode", {
                        required: "Interview Mode is required",
                      })}
                      onChange={(e) => setInterviewMode(e.target.value)}
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    >
                      <option value="">Select Interview Mode</option>
                      <option value="AI">AI Interview</option>
                      <option value="Manual">Manual Interview</option>
                    </select>
                  </FormField>

                  {interviewMode === "AI" && (
                    <>
                      <FormInput
                        label="AI Interview Duration"
                        register={register}
                        name="interviewDuration"
                        type="select"
                        options={FORM_OPTIONS.interviewDurations}
                        error={errors?.interviewDuration}
                      />

                      <FormInput
                        label="AI Interview Type"
                        register={register}
                        name="interviewType"
                        type="select"
                        options={FORM_OPTIONS.interviewTypes}
                        error={errors?.interviewType}
                      />
                    </>
                  )}

                  <div className="col-span-1 md:col-span-2">
                    <LocationPicker
                      selectedCountry={selectedCountry}
                      setSelectedCountry={setSelectedCountry}
                      selectedState={selectedState}
                      setSelectedState={setSelectedState}
                      selectedCity={selectedCity}
                      setSelectedCity={setSelectedCity}
                      errors={errors}
                      jobToEdit={jobToEdit}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1" id="ai-description-editor">
                <div className="flex justify-between items-center gap-3">
                  <label
                    className={`text-sm font-semibold tracking-wide ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Description
                  </label>

                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingAI}
                    className={`relative overflow-hidden flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300
                   ${
                     isGeneratingAI
                       ? "bg-gray-400 text-white cursor-not-allowed"
                       : "bg-gradient-to-r from-gray-500 via-gray-500 to-gray-500 text-white hover:scale-105 hover:shadow-lg active:scale-95"
                   }
                   `}
                  >
                    {!isGeneratingAI && (
                      <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></span>
                    )}

                    {isGeneratingAI ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>AI is thinking…</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">✨</span>
                        <span>Generate with AI</span>
                      </>
                    )}
                  </button>
                </div>

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <ReactQuill
                      {...field}
                      theme="snow"
                      className={`${theme === "dark" ? "dark-quill" : "light-quill"} border rounded text-sm sm:text-base`}
                    />
                  )}
                />
                {errors?.description && (
                  <span className="text-sm text-red-500">
                    {errors?.description.message}
                  </span>
                )}
              </div>

              <CandidateForm
                questions={questions}
                setQuestions={setQuestions}
                addQuestion={addQuestion}
                handleDeleteQuestion={handleDeleteQuestion}
              />

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-[#9333ea] text-white font-medium hover:bg-[#9333ea] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2 transition-colors text-sm sm:text-base"
                >
                  {jobToEdit ? "Update Job Post" : "Create Job Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobForm;
