import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { usePostJob, useUpdateJob } from '../../hooks/useJob';
import { useLocation, useNavigate } from 'react-router-dom';

import PostJobForm from './PostJobForm'; // <-- The new UI component we just created

export const PostJob = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const jobToEdit = location.state?.job;

    // We store questions in state
    const [questions, setQuestions] = useState(
        jobToEdit?.applicationForm?.question.map((q, i) => ({
            question: q,
            answer: jobToEdit.applicationForm.answer[i],
        })) || [{ question: '', answer: '' }]
    );

    // Country, State, City
    const [selectedCountry, setSelectedCountry] = useState(jobToEdit?.country || '');
    const [selectedState, setSelectedState] = useState(jobToEdit?.state || '');
    const [selectedCity, setSelectedCity] = useState(jobToEdit?.city || '');

    // Shift time states
    const [shiftStart, setShiftStart] = useState(jobToEdit?.shiftStart || '09:00');
    const [shiftEnd, setShiftEnd] = useState(jobToEdit?.shiftEnd || '17:00');

    // Fetch the recruiter role from localStorage
    const user = JSON.parse( localStorage.getItem( 'user' ) ); // Parse user object from localStorage
    const recruiterRole = user?.head || '';
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    // const recruiterName = user?.userName || '';

    

    const {
        register,
        handleSubmit,
        control,
        setValue,
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
            status: '',
            recruiterName: recruiterRole ? '' : user._id,
            hiringManagerEmail: '',
            hiringManagerName: '',
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
        // Format the data to include shiftStart, shiftEnd, and separate location fields
        const formattedData = {
            ...data,
            shiftStart,
            shiftEnd,
            country: selectedCountry,
            state: selectedState,
            city: selectedCity,
            compensation: String(data.compensation),
            experienceRequired: String(data.experienceRequired),
            company_id : companyId,
            applicationForm: {
                question: questions.map((q) => q.question),
                answer: questions.map((q) => q.answer),
            },
        };

        if (jobToEdit) {
            updateJob(formattedData, {
                onSuccess: () => {
                    toast.success('Job updated successfully');
                    navigate('/all-jobs');
                },
                onError: () => {
                    toast.error('Failed to update job');
                },
            });
        } else {
            postJob(formattedData, {
                onSuccess: () => {
                    toast.success('Job posted successfully');
                    navigate('/all-jobs');
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

    // Render the new PostJobForm, passing everything it needs
    return (
        <PostJobForm
            jobToEdit={jobToEdit}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            errors={errors}
            register={register}
            control={control}
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
            recruiterRole={ recruiterRole }
            companyId={ companyId }
            // recruiterName={ recruiterName }
        />
    );
};

export default PostJob;
