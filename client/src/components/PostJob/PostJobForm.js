import React, { useEffect, useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { Country, State, City } from "country-state-city";
import ReactQuill from "react-quill";
import CandidateForm from "./CandidateForm";
import "react-quill/dist/quill.snow.css";
import BackButtonMobile from "../Mob-back-btn";
import { useTheme } from "../../context/ThemeContext";

const capitalizeFirstLetter = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};

const FormField = ({ label, error, children }) => {
  const { theme } = useTheme();
  const errorMessage = typeof error === 'object' ? error?.message : error;

  return (
    <div className="space-y-1">
      <label
        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
      >
        {label}
      </label>
      {children}
      {errorMessage && <span className="text-sm text-red-500">{errorMessage}</span>}
    </div>
  );
};

const FormInput = ({
  label,
  register,
  name,
  rules,
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
        <select {...register(name, rules)} className={inputClasses} {...props}>
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
          {...register(name, rules)}
          className={inputClasses}
          placeholder={placeholder}
          {...props}
        />
      )}
    </FormField>
  );
};

const formatExcelTime = (value) => {
  if (value === null || value === undefined || value === "") return "";

  let numValue = typeof value === "number" ? value : parseFloat(value);

  if (!isNaN(numValue) && numValue >= 0 && numValue <= 1 && (typeof value === "number" || value.toString().includes("."))) {
    const totalMinutes = Math.round(numValue * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
  return value.toString() || "";
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
  locationType,
  register,
  setValue,
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
          {...register("country", { required: "Country is required" })}
          value={currentCountryCode}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setSelectedState("");
            setSelectedCity("");
            setValue("country", e.target.value, { shouldValidate: true });
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

      {locationType !== "Remote" && (
        <>
          <FormField label="State" error={errors?.state}>
            <select
              {...register("state", { required: "State is required" })}
              value={currentStateCode}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity("");
                setValue("state", e.target.value, { shouldValidate: true });
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
              {...register("city", { required: "City is required" })}
              value={jobToEdit?.city || selectedCity}
              onChange={(e) => {
                handleCityChange(e);
                setValue("city", e.target.value, { shouldValidate: true });
              }}
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
        </>
      )}
    </div>
  );
};

const SHIFT_OPTIONS = [
  "9 AM - 6 PM",
  "9:30 AM - 6:30 PM",
  "10 AM - 7 PM",
];

const toAmPm = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return timeStr || "";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return timeStr;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const existingAmPm = match[3];

  if (existingAmPm) return timeStr;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return minutes === "00" ? `${hours} ${ampm}` : `${hours}:${minutes} ${ampm}`;
};

const formatShiftDisplay = (start, end) => {
  if (!start && !end) return "9 AM - 6 PM";
  if (start && end) {
    if (start.includes("-") || start.includes("to")) return start;
    return `${toAmPm(start)} - ${toAmPm(end)}`;
  }
  return toAmPm(start || end) || "9 AM - 6 PM";
};

const ShiftPicker = ({
  shiftStart,
  setShiftStart,
  shiftEnd,
  setShiftEnd,
  errors,
}) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(() =>
    formatShiftDisplay(shiftStart, shiftEnd)
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatShiftDisplay(shiftStart, shiftEnd));
    }
  }, [shiftStart, shiftEnd, isFocused]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateShiftTimes = (val) => {
    const cleanVal = val.trim();
    if (!cleanVal) {
      setShiftStart("");
      setShiftEnd("");
      return;
    }

    const splitRegex = /[-–—]|(?:\s+to\s+)/i;
    const parts = cleanVal.split(splitRegex);

    if (parts.length >= 2) {
      setShiftStart(parts[0].trim());
      setShiftEnd(parts.slice(1).join(" - ").trim());
    } else {
      setShiftStart(cleanVal);
      setShiftEnd("");
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (!isOpen) setIsOpen(true);
    updateShiftTimes(val);
  };

  const handleSelectOption = (option) => {
    setInputValue(option);
    setIsOpen(false);
    updateShiftTimes(option);
  };

  const inputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10 ${theme === "dark"
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
    }`;

  return (
    <div className="relative" ref={dropdownRef}>
      <FormField label="Shift Time" error={errors?.shiftStart || errors?.shiftEnd}>
        <div className="relative flex items-center">
          <input
            type="text"
            id="shiftStart"
            name="shiftStart"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              setIsOpen(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder="Ex: 9 AM - 6 PM"
            className={inputClasses}
            autoComplete="off"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsOpen(!isOpen)}
            className={`absolute right-3 focus:outline-none transition-colors ${theme === "dark"
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-500 hover:text-gray-700"
              }`}
            aria-label="Toggle shift time options"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </FormField>

      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg border max-h-60 overflow-auto focus:outline-none transition-all duration-150 ${theme === "dark"
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-white border-gray-200 text-gray-900"
            }`}
        >
          {SHIFT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectOption(option);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${theme === "dark"
                ? "hover:bg-gray-600 focus:bg-gray-600 text-gray-200"
                : "hover:bg-blue-50 focus:bg-blue-50 text-gray-700 hover:text-blue-600"
                } ${inputValue === option
                  ? theme === "dark"
                    ? "bg-gray-600 font-medium"
                    : "bg-blue-50 text-blue-600 font-medium"
                  : ""
                }`}
            >
              <span>{option}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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

const convertNumber = (numStr, factor) => {
  const cleanNumStr = numStr.replace(/,/g, '');
  const num = parseFloat(cleanNumStr);
  if (isNaN(num)) return numStr;

  const res = num * factor;

  if (res >= 10) {
    return Math.round(res).toString();
  } else {
    return Number(res.toFixed(2)).toString();
  }
};

const convertCompensationString = (str, factor) => {
  if (!str || typeof str !== 'string') return str || '';
  return str.replace(/(\d+(?:,\d+)*(?:\.\d+)?)/g, (match) => convertNumber(match, factor));
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
  const [skillsExperienceList, setSkillsExperienceList] = useState(() => {
    if (jobToEdit?.skillsExperienceList && Array.isArray(jobToEdit.skillsExperienceList) && jobToEdit.skillsExperienceList.length > 0) {
      return jobToEdit.skillsExperienceList;
    }
    const exp = String(jobToEdit?.experienceRequired || "");
    const sk = jobToEdit?.skillsRequired || jobToEdit?.requiredSkills || jobToEdit?.skills || "";
    const skStr = Array.isArray(sk) ? sk.join(", ") : String(sk);
    if (exp || skStr) {
      return [{ skills: skStr, experience: exp }];
    }
    return [{ skills: "", experience: "" }];
  });

  const [showExperienceSkills, setShowExperienceSkills] = useState(() => {
    return Boolean(
      (jobToEdit?.skillsExperienceList && jobToEdit.skillsExperienceList.length > 0) ||
      jobToEdit?.experienceRequired ||
      jobToEdit?.skillsRequired ||
      jobToEdit?.requiredSkills ||
      jobToEdit?.skills
    );
  });

  useEffect(() => {
    if (jobToEdit && (jobToEdit.skillsExperienceList || jobToEdit.experienceRequired || jobToEdit.skillsRequired || jobToEdit.requiredSkills || jobToEdit.skills)) {
      setShowExperienceSkills(true);
      if (jobToEdit.skillsExperienceList && Array.isArray(jobToEdit.skillsExperienceList) && jobToEdit.skillsExperienceList.length > 0) {
        setSkillsExperienceList(jobToEdit.skillsExperienceList);
      } else {
        const exp = String(jobToEdit.experienceRequired || "");
        const sk = jobToEdit.skillsRequired || jobToEdit.requiredSkills || jobToEdit.skills || "";
        const skStr = Array.isArray(sk) ? sk.join(", ") : String(sk);
        setSkillsExperienceList([{ skills: skStr, experience: exp }]);
      }
    }
  }, [jobToEdit]);

  useEffect(() => {
    if (showExperienceSkills) {
      const allExp = skillsExperienceList.map(item => (item.experience || "").trim()).filter(Boolean);
      const allSkills = skillsExperienceList.flatMap(item => (item.skills || "").split(",").map(s => s.trim()).filter(Boolean));
      setValue("experienceRequired", allExp, { shouldDirty: true });
      setValue("skillsRequired", allSkills, { shouldDirty: true });
    } else {
      setValue("experienceRequired", [], { shouldDirty: true });
      setValue("skillsRequired", [], { shouldDirty: true });
    }
  }, [skillsExperienceList, showExperienceSkills, setValue]);

  const handleAddSkillExperience = () => {
    setSkillsExperienceList((prev) => [...prev, { skills: "", experience: "" }]);
  };

  const handleRemoveSkillExperience = (indexToRemove) => {
    setSkillsExperienceList((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSkillExperienceChange = (index, field, val) => {
    setSkillsExperienceList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

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
      const compensation = watch("compensationVal");
      const experience = watch("experienceRequired");

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/ai/generate-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Company_id': companyId,
          },
          body: JSON.stringify({
            jobTitle,
            companyUserName,
            compensation,
            experience
          }),
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
      if (showExperienceSkills) {
        data.skillsRequired = skillsExperienceList.flatMap(item => (item.skills || "").split(",").map(s => s.trim()).filter(Boolean));
        data.experienceRequired = skillsExperienceList.map(item => (item.experience || "").trim()).filter(Boolean);
      } else {
        data.skillsRequired = [];
        data.experienceRequired = [];
      }
      delete data.skillsExperienceList;
      delete data.requiredSkills;
      delete data.skills;

      // Add title code to data if it's a new job
      if (!jobToEdit) {
        data.titleCode = titleCode;
      }

      await onSubmit(data);
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  const onError = (errors) => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      // Order of fields to check for prioritized scrolling
      const fieldOrder = [
        "title",
        "locationType",
        "state", // If we add validation later
        "city",
        "type", // Employment Type
        "scheduleType",
        "shiftStart",
        "shiftEnd",
        "hireType",
        "compensationVal",
        "experienceRequired",
        "skillsRequired",
        "requiredResources",
        "status",
        "recruiterId",
        "hiringManagerId",
        "interviewMode",
        "interviewDuration",
        "interviewType",
        "description"
      ];

      const firstErrorField = fieldOrder.find(field => errors[field]);
      const targetField = firstErrorField || errorFields[0];

      if (targetField === "description") {
        const element = document.getElementById("ai-description-editor");
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        const element = document.querySelector(`[name="${targetField}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
        element?.focus();
      }
    }
  };

  const { onChange: onPeriodChange, ...periodRegister } = register("compensationPeriod");
  const currentPeriod = watch("compensationPeriod");
  const currentCompVal = watch("compensationVal");

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    if (currentPeriod && currentPeriod !== newPeriod && currentCompVal) {
      let factor = 1;
      if (currentPeriod === "Month" && newPeriod === "Year") {
        factor = 12;
      } else if (currentPeriod === "Year" && newPeriod === "Month") {
        factor = 1 / 12;
      }
      if (factor !== 1) {
        const convertedVal = convertCompensationString(String(currentCompVal), factor);
        setValue("compensationVal", convertedVal, { shouldValidate: true, shouldDirty: true });
      }
    }
    if (onPeriodChange) {
      onPeriodChange(e);
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
              onSubmit={handleSubmit(enhancedOnSubmit, onError)}
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
                      rules={{ required: "Title is required" }}
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
                    rules={{ required: "Location Type is required" }}
                    error={errors?.locationType}
                  />

                  <FormInput
                    label="Employment Type"
                    register={register}
                    name="type"
                    type="select"
                    options={FORM_OPTIONS.employment}
                    rules={{ required: "Employment Type is required" }}
                    error={errors?.type}
                  />

                  <FormInput
                    label="Schedule Type"
                    register={register}
                    name="scheduleType"
                    type="select"
                    options={FORM_OPTIONS.schedule}
                    rules={{ required: "Schedule Type is required" }}
                    error={errors?.scheduleType}
                  />

                  {watch("scheduleType") !== "Flexible" && (
                    <ShiftPicker
                      shiftStart={shiftStart}
                      setShiftStart={setShiftStart}
                      shiftEnd={shiftEnd}
                      setShiftEnd={setShiftEnd}
                      errors={errors}
                    />
                  )}

                  <FormInput
                    label="Hire Type"
                    register={register}
                    name="hireType"
                    type="select"
                    options={FORM_OPTIONS.hire}
                    rules={{ required: "Hire Type is required" }}
                    error={errors?.hireType}
                  />

                  <div className="grid grid-cols-3 gap-4 items-start">
                    <div className="col-span-2">
                      <FormInput
                        label="Compensation"
                        register={register}
                        name="compensationVal"
                        rules={{ required: "Compensation is required" }}
                        error={errors?.compensationVal}
                        placeholder="Ex: 50000 - 60000"
                      />
                    </div>
                    <div>
                      <FormField label="Period" error={errors?.compensationPeriod}>
                        <select
                          {...periodRegister}
                          onChange={handlePeriodChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                        >
                          <option value="Month">Monthly</option>
                          <option value="Year">Yearly</option>
                        </select>
                      </FormField>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border transition-colors ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="requireExperienceSkills"
                          checked={showExperienceSkills}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setShowExperienceSkills(checked);
                            if (!checked) {
                              setValue("experienceRequired", "");
                              setValue("skillsRequired", "");
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        />
                        <label
                          htmlFor="requireExperienceSkills"
                          className={`text-sm font-semibold cursor-pointer ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                        >
                          Minimum Experience & Skills Required
                        </label>
                      </div>
                    </div>

                    {showExperienceSkills && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                        {skillsExperienceList.map((item, index) => (
                          <div
                            key={index}
                            className={`relative p-4 rounded-lg border ${
                              theme === "dark"
                                ? "bg-gray-900/50 border-gray-700"
                                : "bg-white border-gray-200 shadow-sm"
                            }`}
                          >
                            {skillsExperienceList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSkillExperience(index)}
                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors p-1"
                                title="Remove this field"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-6">
                              <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Skills Required {skillsExperienceList.length > 1 ? `#${index + 1}` : ""} <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={item.skills || ""}
                                  onChange={(e) => handleSkillExperienceChange(index, "skills", e.target.value)}
                                  placeholder="Ex: React, Node.js, MongoDB"
                                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    theme === "dark"
                                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                  }`}
                                  required={showExperienceSkills}
                                />
                              </div>

                              <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Minimum Experience Required {skillsExperienceList.length > 1 ? `#${index + 1}` : ""} <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={item.experience || ""}
                                  onChange={(e) => handleSkillExperienceChange(index, "experience", e.target.value)}
                                  placeholder="Ex: 3 (Years)"
                                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    theme === "dark"
                                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                  }`}
                                  required={showExperienceSkills}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={handleAddSkillExperience}
                          className={`w-full py-2.5 px-4 border border-dashed rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
                            theme === "dark"
                              ? "border-gray-600 text-blue-400 hover:bg-gray-800/80 hover:border-blue-500"
                              : "border-gray-300 text-blue-600 hover:bg-blue-50/50 hover:border-blue-400"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Add More Skills & Experience</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <FormInput
                    label="Required Number of Resources"
                    register={register}
                    name="requiredResources"
                    type="number"
                    rules={{ required: "Required Resources is required" }}
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
                        {...register("recruiterId", { required: "Recruiter is required" })}
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
                      {/* <option value="AI">AI Interview</option> */}
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
                        rules={{ required: "Interview Duration is required" }}
                        error={errors?.interviewDuration}
                      />

                      <FormInput
                        label="AI Interview Type"
                        register={register}
                        name="interviewType"
                        type="select"
                        options={FORM_OPTIONS.interviewTypes}
                        rules={{ required: "Interview Type is required" }}
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
                      locationType={watch("locationType")}
                      register={register}
                      setValue={setValue}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1" id="ai-description-editor">
                <div className="flex justify-between items-center gap-3">
                  <label
                    className={`text-sm font-semibold tracking-wide ${theme === "dark" ? "text-gray-200" : "text-gray-800"
                      }`}
                  >
                    Description
                  </label>

                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingAI}
                    className={`relative overflow-hidden flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300
                   ${isGeneratingAI
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
                  rules={{ required: "Description is required" }}
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

