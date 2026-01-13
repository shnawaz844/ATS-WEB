import React from 'react'
import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';

export const ApplicationForm = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const { id } = useParams();
    const [job, setJob] = useState([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            resume: "",
            coverLetter: "",
            applicationForm: [{
                question: "",
                answer: ""
            }],
        }
    })

    const onSubmit = async (data) => {
        const newData = { ...data, jobID: id };

        try {
            // Send application data
            const applicationRes = await fetch(`${process.env.REACT_APP_BASE_URL}/application/post-application`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(newData),
            });
            const applicationResult = await applicationRes.json();
            console.log("Application Result:", applicationResult);

            // Update job by candidate
            const jobUpdateRes = await fetch(`${process.env.REACT_APP_BASE_URL}/jobs/update-job-by-candidate`, {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    jobID: id,
                    candidateID: "667336c6ab92f179a717d0ec", // This should ideally come from authenticated user context
                    status: "active"
                }),
            });
            const jobUpdateResult = await jobUpdateRes.json();
            console.log("Job Update Result:", jobUpdateResult);

            // Update user by candidate
            const userUpdateRes = await fetch(`${process.env.REACT_APP_BASE_URL}/users/update-user-by-candidate`, {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    jobID: id,
                    candidateID: "667336c6ab92f179a717d0ec", // This should ideally come from authenticated user context
                    status: "active"
                }),
            });
            const userUpdateResult = await userUpdateRes.json();
            console.log("User Update Result:", userUpdateResult);

            toast.success("Application submitted successfully!");
            navigate("/"); // Redirect to home or a success page
        } catch (error) {
            console.error("Error submitting application:", error);
            toast.error("Failed to submit application.");
        }
    };

    useEffect(() => {
        try {
            fetch(`${process.env.REACT_APP_BASE_URL}/jobs/current-job/${id}`).then((res) => res.json()).then((data) => setJob(data))
        } catch (error) {
            console.log(error);
        }
    }, []);

    return (
        <div className={`max-w-4xl mx-auto p-8 rounded-2xl shadow-lg mt-10 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-50'}`}>
            <h2 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Job Application</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Input */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                        <div className="relative">
                            {/* Assuming 'User' icon component exists, otherwise replace with a simple div or remove */}
                            {/* <User className={`absolute left-3 top-3 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} /> */}
                            <input
                                {...register("name", { required: "Name is required" })}
                                className={`w-full pl-4 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                placeholder="John Doe"
                            />
                            {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                        <div className="relative">
                            {/* <Mail className={`absolute left-3 top-3 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} /> */}
                            <input
                                {...register("email", { required: "Email is required", pattern: /^\S+@\S+$/i })}
                                className={`w-full pl-4 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                placeholder="john.doe@example.com"
                            />
                            {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>}
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                        <div className="relative">
                            {/* <Phone className={`absolute left-3 top-3 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} /> */}
                            <input
                                {...register("phone")}
                                className={`w-full pl-4 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    {/* Resume Upload */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Resume (PDF, DOCX)</label>
                        <input
                            type="file"
                            {...register("resume")}
                            className={`w-full text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100`}
                        />
                    </div>
                </div>

                {/* Cover Letter */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Cover Letter</label>
                    <textarea
                        {...register("coverLetter")}
                        rows="4"
                        className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                        placeholder="Tell us why you're a great fit..."
                    ></textarea>
                </div>

                {/* Job Specific Questions */}
                <div className={`w-full p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'}`}>
                    <h1 className={`text-md mb-2 font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{job.jobTitle} Role</h1>
                    <h1 className='text-sm italic mt-4'>Answer below questions to proceed</h1>

                    {job.applicationForm && job.applicationForm.question && job.applicationForm.question.map((question, index) => (
                        <RenderQuestion {...register(`applicationForm.${index}.question`)} key={index} index={index} question={question} register={register} theme={theme} />
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                    >
                        Submit Application
                    </button>
                </div>
            </form>
        </div>
    )
}

function RenderQuestion({ index, question, register, theme }) {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 items-center pt-2 md:my-0'>
            <label className={`block mt-2 m-1 text-sm ${theme === 'dark' ? 'text-gray-300' : ''}`} >{index + 1}. {question}</label>
            <div className='grid grid-cols-2 items-center justify-items-center'>
                <div className='flex'>
                    <input {...register(`applicationForm.${index}.answer`, { required: true })} type="radio" value="Yes" className='mx-2' />
                    <p>Yes</p>
                </div>
                <div className='flex'>
                    <input {...register(`applicationForm.${index}.answer`, { required: true })} type="radio" value="No" className='mx-2' />
                    <p>No</p>
                </div>
            </div>
        </div>
    );
}
