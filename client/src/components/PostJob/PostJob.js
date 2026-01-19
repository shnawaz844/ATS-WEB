import React, { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { usePostJob, useUpdateJob } from '../../hooks/useJob';
import { useLocation, useNavigate } from 'react-router-dom';
import PostJobForm from './PostJobForm';


export const PostJob = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const jobToEdit = location.state?.job;
    const companyUserName = localStorage.getItem("companyUserName");
    console.log("jobToEdit", jobToEdit)
    // We store questions in state
    const [questions, setQuestions] = useState(
        jobToEdit?.applicationForm?.question.map((q, i) => ({
            question: q,
            answer: jobToEdit.applicationForm.answer[i],
        })) || [{ question: '', answer: '' }]
    );

    const [jobStatus, setJobStatus] = useState(jobToEdit?.status || '');

    // Country, State, City
    const [selectedCountry, setSelectedCountry] = useState(jobToEdit?.country || '');
    const [selectedState, setSelectedState] = useState(jobToEdit?.state || '');
    const [selectedCity, setSelectedCity] = useState(jobToEdit?.city || '');

    // Shift time states
    const [shiftStart, setShiftStart] = useState(jobToEdit?.shiftStart || '09:00');
    const [shiftEnd, setShiftEnd] = useState(jobToEdit?.shiftEnd || '17:00');

    // Fetch the recruiter role from localStorage
    const user = JSON.parse(localStorage.getItem('user')); // Parse user object from localStorage
    const recruiterRole = user?.head || '';
    const companyId = JSON.parse(localStorage.getItem("user")).company_id;
    const [hiringManagersList, setHiringManagersList] = useState([]);

    // Fetch hiring managers
    useEffect(() => {
        const fetchHiringManagers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/hiringmanager/all-hiring-manager`, {
                    headers: {
                        'company_id': companyId
                    }
                });
                const data = await response.json();
                setHiringManagersList(data);
            } catch (error) {
                console.error('Error fetching hiring managers:', error);
            }
        };
        fetchHiringManagers();
    }, [companyId]);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: '',
            locationType: '',
            type: '',
            scheduleType: '',
            hireType: '',
            country: '',
            state: '',
            city: '',
            compensation: '',
            experienceRequired: '',
            requiredResources: '',
            status: jobToEdit?.status || '',
            recruiterId: recruiterRole ? '' : user._id,
            hiringManagerId: jobToEdit?.hiringManagerId || '',
            description: '',
            applicationForm: {
                question: questions.map((q) => q.question),
                answer: questions.map((q) => q.answer),
            },
            company_id: companyId
        },
    });

    const { mutate: postJob } = usePostJob();
    const { mutate: updateJob } = useUpdateJob();

    // Populate form if editing an existing job
    useEffect(() => {
        if (jobToEdit) {
            Object.keys(jobToEdit).forEach((key) => {
                if (key !== 'applicationForm') {
                    setValue(key, jobToEdit[key]);
                }
            });

            if (jobToEdit.shiftStart) setShiftStart(jobToEdit.shiftStart);
            if (jobToEdit.shiftEnd) setShiftEnd(jobToEdit.shiftEnd);

            if (jobToEdit.description) setValue('description', jobToEdit.description);

            if (jobToEdit.country) setSelectedCountry(jobToEdit.country);
            if (jobToEdit.state) setSelectedState(jobToEdit.state);
            if (jobToEdit.city) setSelectedCity(jobToEdit.city);
        }
    }, [jobToEdit, setValue]);

    // The form submit handler
    const onSubmit = (data) => {
        // Find the selected hiring manager
        const selectedHiringManager = hiringManagersList.find(
            manager => manager._id === data.hiringManagerId
        );

        if (!selectedHiringManager) {
            toast.error('Please select a valid hiring manager');
            return;
        }
        // Format the data to include shiftStart, shiftEnd, and separate location fields
        const formattedData = {
            ...data,
            shiftStart,
            shiftEnd,
            // status: "Screening",
            country: selectedCountry,
            state: selectedState,
            city: selectedCity,
            compensation: String(data.compensation),
            experienceRequired: String(data.experienceRequired),
            company_id: companyId,
            hiringManagerId: selectedHiringManager._id,
            applicationForm: {
                question: questions.map((q) => q.question),
                answer: questions.map((q) => q.answer),
            },
        };

        if (jobToEdit) {
            updateJob(formattedData, {
                onSuccess: () => {
                    toast.success('Job updated successfully');
                    navigate(`/${companyUserName}/all-jobs`);
                },
                onError: () => {
                    toast.error('Failed to update job');
                },
            });
        } else {
            console.log("formattedData", formattedData)
            postJob(formattedData, {
                onSuccess: () => {
                    toast.success('Job posted successfully');
                    navigate(`/${companyUserName}/all-jobs`);
                },
                onError: () => {
                    toast.error('Failed to post job');
                },
            });
        }
    };

    // Add a new question
    const addQuestion = () => {
        setQuestions([...questions, { question: '', answer: '' }]);
    };

    // Delete a question by index
    const handleDeleteQuestion = (index) => {
        const newQuestions = questions.filter((_, qIndex) => qIndex !== index);
        setQuestions(newQuestions);
    };
    console.log("hiringManagersList", hiringManagersList)
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
        />
    );
};

export default PostJob;
