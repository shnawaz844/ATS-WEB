import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { usePostJob, useUpdateJob } from "../../hooks/useJob";
import { useLocation, useNavigate } from "react-router-dom";
import PostJobForm from "./PostJobForm";
import axios from "axios";
import { Country, State } from "country-state-city";

export const PostJob = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobToEdit = location.state?.job;
  const companyUserName = localStorage.getItem("companyUserName");

  const formatExcelTime = (value) => {
    if (value === null || value === undefined || value === "") return "";

    let numValue = typeof value === "number" ? value : parseFloat(value);

    // Check if it's a valid Excel decimal time (usually between 0 and 1)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1 && (typeof value === "number" || value.toString().includes("."))) {
      const totalMinutes = Math.round(numValue * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }
    return value.toString() || "";
  };

  console.log("jobToEdit", jobToEdit);
  // We store questions in state
  const [questions, setQuestions] = useState(
    jobToEdit?.applicationForm?.question.map((q, i) => ({
      question: q,
      answer: jobToEdit.applicationForm.answer[i],
    })) || [{ question: "", answer: "" }],
  );

  const [jobStatus, setJobStatus] = useState(jobToEdit?.status || "");

  // Country, State, City
  const [selectedCountry, setSelectedCountry] = useState(
    jobToEdit?.country || "",
  );
  const [selectedState, setSelectedState] = useState(jobToEdit?.state || "");
  const [selectedCity, setSelectedCity] = useState(jobToEdit?.city || "");
  const [interviewMode, setInterviewMode] = useState(
    jobToEdit?.interviewMode || "Manual",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [interviewRounds, setInterviewRounds] = useState([]);
  const [roundsMap, setRoundsMap] = useState({});

  // Shift time states
  const [shiftStart, setShiftStart] = useState(
    formatExcelTime(jobToEdit?.shiftStart) || "9 AM",
  );
  const [shiftEnd, setShiftEnd] = useState(
    formatExcelTime(jobToEdit?.shiftEnd) || "6 PM",
  );

  // Fetch the recruiter role from localStorage
  const user = JSON.parse(localStorage.getItem("user")); // Parse user object from localStorage
  const recruiterRole = user?.head || "";
  const companyId = JSON.parse(localStorage.getItem("user")).company_id;
  const [hiringManagersList, setHiringManagersList] = useState([]);

  // Fetch hiring managers
  useEffect(() => {
    const fetchHiringManagers = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/hiringmanager/all-hiring-manager`,
          {
            headers: {
              company_id: companyId,
            },
          },
        );
        const data = await response.json();
        setHiringManagersList(data);
      } catch (error) {
        console.error("Error fetching hiring managers:", error);
      }
    };
    fetchHiringManagers();
  }, [companyId]);

  // Fetch Interview Rounds
  useEffect(() => {
    const fetchInterviewRounds = async () => {
      try {
        const companyId = JSON.parse(localStorage.getItem("user")).company_id;
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/interviews/all-interviews?page=1&limit=100&search=`,
          {
            headers: { company_id: companyId },
          },
        );
        const rounds = res.data.interviews;
        const map = {};
        rounds.forEach((round) => {
          map[round._id] = round.roundName;
        });
        setRoundsMap(map);
        setInterviewRounds(rounds);
      } catch (error) {
        console.error("Failed to fetch interview rounds", error);
      }
    };

    fetchInterviewRounds();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      locationType: "",
      type: "",
      scheduleType: "",
      hireType: "",
      country: "",
      state: "",
      city: "",
      compensation: "",
      compensationVal: "",
      compensationPeriod: "Month",
      experienceRequired: "",
      skillsRequired: "",
      skillsExperienceList: [],
      requiredResources: "",
      status: jobToEdit?.status || "",
      recruiterId: recruiterRole ? "" : user._id,
      hiringManagerId: jobToEdit?.hiringManagerId || "",
      description: "",
      applicationForm: {
        question: questions.map((q) => q.question),
        answer: questions.map((q) => q.answer),
      },
      interviewMode: jobToEdit?.interviewMode || "Manual",
      interviewDuration: "",
      interviewType: "",
      company_id: companyId,
    },
  });

  const { mutate: postJob } = usePostJob();
  const { mutate: updateJob } = useUpdateJob();

  // Populate form if editing an existing job
  useEffect(() => {
    if (jobToEdit) {
      Object.keys(jobToEdit).forEach((key) => {
        if (key !== "applicationForm") {
          setValue(key, jobToEdit[key]);
        }
      });

      if (jobToEdit.shiftStart) setShiftStart(formatExcelTime(jobToEdit.shiftStart));
      if (jobToEdit.shiftEnd) setShiftEnd(formatExcelTime(jobToEdit.shiftEnd));

      if (jobToEdit.description) setValue("description", jobToEdit.description);

      if (jobToEdit.compensation) {
        const compStr = jobToEdit.compensation.toString();
        const cleanVal = compStr.split('/')[0].split('(')[0].trim();
        const hasMo = compStr.toLowerCase().includes("month") || compStr.toLowerCase().includes("/mo");
        setValue("compensationVal", cleanVal);
        setValue("compensationPeriod", hasMo ? "Month" : "Year");
      }

      if (jobToEdit.country) setSelectedCountry(jobToEdit.country);
      if (jobToEdit.state) setSelectedState(jobToEdit.state);
      if (jobToEdit.city) setSelectedCity(jobToEdit.city);
    }
  }, [jobToEdit, setValue]);

  // The form submit handler
  const onSubmit = (data) => {
    // Find the selected interview round if AI mode is selected
    let interviewTypeData = null;
    if (interviewMode === "AI" && data.interviewType) {
      const selectedRound = interviewRounds.find(
        (round) => round._id === data.interviewType,
      );
      if (selectedRound) {
        interviewTypeData = {
          roundId: selectedRound._id,
          roundName: selectedRound.roundName,
        };
      }
    }
    // Convert Country and State codes to names
    const countryObj = Country.getCountryByCode(selectedCountry);
    const countryName = countryObj ? countryObj.name : selectedCountry;

    const stateObj = State.getStateByCodeAndCountry(selectedState, selectedCountry);
    const stateName = stateObj ? stateObj.name : selectedState;

    // Format the data to include shiftStart, shiftEnd, and separate location fields
    const formattedData = {
      ...data,
      shiftStart,
      shiftEnd,
      // status: "Screening",
      country: countryName,
      state: stateName,
      city: selectedCity,
      compensation: `${data.compensationVal}/${data.compensationPeriod}`,
      experienceRequired: Array.isArray(data.experienceRequired) ? data.experienceRequired : [String(data.experienceRequired || "")].filter(Boolean),
      skillsRequired: Array.isArray(data.skillsRequired) ? data.skillsRequired : [String(data.skillsRequired || "")].filter(Boolean),
      company_id: companyId,
      hiringManagerId: "",
      interviewMode: interviewMode,
      interviewType: interviewTypeData,
      applicationForm: {
        question: questions.map((q) => q.question),
        answer: questions.map((q) => q.answer),
      },
    };
    delete formattedData.compensationVal;
    delete formattedData.compensationPeriod;
    delete formattedData.skillsExperienceList;
    delete formattedData.requiredSkills;
    delete formattedData.skills;

    console.log("🔥 Submitting formattedData to backend:", formattedData);

    setIsLoading(true);

    if (jobToEdit) {
      updateJob(formattedData, {
        onSuccess: () => {
          toast.success("Job updated successfully");
          setIsLoading(false);
          navigate(`/${companyUserName}/all-jobs`);
        },
        onError: () => {
          toast.error("Failed to update job");
          setIsLoading(false);
        },
      });
    } else {
      console.log("formattedData", formattedData);
      postJob(formattedData, {
        onSuccess: async (data) => {
          toast.success("Job posted successfully");
          
          try {
            // Auto-apply logic for waitlist candidates
            const waitlistRes = await fetch(`${process.env.REACT_APP_BASE_URL}/waitlist/get-waitlist`, {
                headers: { "Company_id": companyId }
            });
            const waitlistResult = await waitlistRes.json();
            
            if (waitlistResult.success && waitlistResult.data) {
                const waitlist = waitlistResult.data;
                const jobTitle = formattedData.title?.trim().toLowerCase();
                const jobId = data?.job?._id || data?.job?.id;
                
                if (jobTitle && jobId) {
                    const matchedWaitlist = waitlist.filter(item => {
                        const waitlistRole = item.role?.trim().toLowerCase();
                        if (!waitlistRole) return false;
                        return jobTitle.includes(waitlistRole) || waitlistRole.includes(jobTitle);
                    });

                    const pendingMatched = matchedWaitlist.filter(item => item.status === 'Pending' || item.status === 'Reviewed');

                    for (const item of pendingMatched) {
                        try {
                            await fetch(`${process.env.REACT_APP_BASE_URL}/waitlist/apply-to-job`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    "Company_id": companyId
                                },
                                body: JSON.stringify({ waitlistId: item.id || item._id, jobId: jobId })
                            });
                        } catch (err) {
                            console.error("Error auto-applying waitlist item:", err);
                        }
                    }
                }
            }
          } catch (err) {
             console.error("Error processing auto-apply for waitlist:", err);
          }

          setIsLoading(false);
          navigate(`/${companyUserName}/all-jobs`);
        },
        onError: () => {
          toast.error("Failed to post job");
          setIsLoading(false);
        },
      });
    }
  };

  // Add a new question
  const addQuestion = () => {
    setQuestions([...questions, { question: "", answer: "" }]);
  };

  // Delete a question by index
  const handleDeleteQuestion = (index) => {
    const newQuestions = questions.filter((_, qIndex) => qIndex !== index);
    setQuestions(newQuestions);
  };
  console.log("hiringManagersList", hiringManagersList);
  // Render the new PostJobForm, passing everything it needs
  return (
    <PostJobForm
      jobToEdit={jobToEdit}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      register={register}
      control={control}
      setValue={setValue}
      watch={watch}
      shiftStart={shiftStart}
      setShiftStart={setShiftStart}
      shiftEnd={shiftEnd}
      setShiftEnd={setShiftEnd}
      questions={questions}
      setQuestions={setQuestions}
      addQuestion={addQuestion}
      handleDeleteQuestion={handleDeleteQuestion}
      selectedCountry={selectedCountry}
      setSelectedCountry={setSelectedCountry}
      selectedState={selectedState}
      setSelectedState={setSelectedState}
      selectedCity={selectedCity}
      setSelectedCity={setSelectedCity}
      recruiterRole={recruiterRole}
      companyId={companyId}
      hiringManagersList={hiringManagersList}
      jobStatus={jobStatus}
      setJobStatus={setJobStatus}
      interviewMode={interviewMode}
      setInterviewMode={setInterviewMode}
      interviewRounds={interviewRounds}
      isLoading={isLoading}
    />
  );
};

export default PostJob;

