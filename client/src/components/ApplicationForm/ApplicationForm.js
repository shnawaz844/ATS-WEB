import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
    FileUp,
    Mail,
    Clock,
    Send,
    AlertCircle,
    CheckCircle,
    FileText,
    User,
    Lock
} from "lucide-react";
import emailjs from "@emailjs/browser";

export const ApplicationForm = ( { job, loginData, applicationTypesData, company_id }) => {
    const companyUserName = localStorage.getItem("companyUserName");
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

      // Fetch company_id from localStorage (or use the passed prop)
    const companyId = company_id || JSON.parse( localStorage.getItem( "user" ) )?.company_id;
    const [ emailStatus, setEmailStatus ] = useState( "" ); 
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        defaultValues: {
            candidateID: "",
            jobID: "",
            applicationStatus: "",
            resume: null,
            contactInfo: "",
            emailInfo:"",
            experience: "",
            additionalDocuments: null,
            questions: [],
            answers: [],
            companyId: companyId,
        },
    });

    // Initialize EmailJS (similar to your first document)
    useEffect( () => {
        // Initialize EmailJS with your public key
        if ( process.env.REACT_APP_EMAILJS_PUBLIC_KEY ) {
            emailjs.init( process.env.REACT_APP_EMAILJS_PUBLIC_KEY );
        }
    }, [] );

    // Handle file
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    // Set initial application status
    useEffect(() => {
        if (applicationTypesData?.applicationTypes) {
            const step1Status = applicationTypesData.applicationTypes.find(
                (status) => status.applicationStep === "1"
            );
            if (step1Status) {
                setValue("applicationStatus", step1Status.applicationStatus);
            }
        }
    }, [applicationTypesData, setValue]);

    // Improved EmailJS function (based on your first document)
    const sendConfirmationEmail = async ( formData ) => {
        console.log( "formData", formData )
        try {
            setEmailStatus( "Sending confirmation email..." );

            const templateParams = {
                // Recipient information
                to_email: formData.emailInfo,
                applicant_name: loginData.name || "Applicant",
                applicant_email: formData.emailInfo,

                // Job and company information
                job_title: job.title || "Position",
                company_name: companyUserName || "Company",

                // Application details
                contact_info: formData.contactInfo,
                experience: formData.experience,
                application_date: new Date().toLocaleDateString(),

                // Additional information
                job_description: job.description || "",
                application_status: formData.applicationStatus || "Submitted",
            };

            console.log( "Sending email with template params:", templateParams );

            const response = await emailjs.send(
                process.env.REACT_APP_EMAILJS_SERVICE_ID,
                process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
                templateParams,
                process.env.REACT_APP_EMAILJS_PUBLIC_KEY
            );

            console.log( "✅ Email sent successfully!", response.status, response.text );
            setEmailStatus( "Confirmation email sent successfully!" );
            return true;

        } catch ( error ) {
            console.error( "❌ EmailJS Error:", error );
            setEmailStatus( "Failed to send confirmation email, but application was submitted." );

            // Log detailed error information
            if ( error.status ) {
                console.error( "Error Status:", error.status );
                console.error( "Error Text:", error.text );
            }

            return false;
        }
    };

    const onSubmit = async ( data ) => {
        console.log( "data", data )
        // Check candidate login again as a safeguard
        if ( !loginData || loginData?.role !== "candidate" ) {
            navigate( "/login", { state: { returnUrl: window.location.pathname, message: "Please log in to apply for this job" } } );
            return;
        }

        setIsSubmitting( true );
        setEmailStatus( "" );

        // Prepare FormData
        const formData = new FormData();
        formData.append( "candidateID", loginData._id );
        formData.append( "jobID", job._id );
        formData.append( "applicationStatus", data.applicationStatus );
        formData.append( "resume", file );
        formData.append( "contactInfo", data.contactInfo );
        formData.append( "emailInfo", data.emailInfo );
        formData.append( "experience", data.experience );
        formData.append( "additionalDocuments", data.additionalDocuments );
        formData.append( "questions", JSON.stringify( job.applicationForm.question ) );
        formData.append( "answers", JSON.stringify( data.answers ) );
        formData.append( "company_id", companyId );

        try {
            const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/application/add-application`, {
                method: "POST",
                headers: {
                    "company_id": companyId,
                },
                body: formData,
            } );
            const result = await response.json();

            if ( response.ok ) {
                console.log( "✅ Application submitted successfully!" );

                // Send confirmation email after successful application submission
                const emailSent = await sendConfirmationEmail( data );

                // Set success message based on email status
                if ( emailSent ) {
                    setSuccessMessage( "Application submitted successfully! Check your email for confirmation." );
                } else {
                    setSuccessMessage( "Application submitted successfully! (Email confirmation may have failed)" );
                }

                // Redirect after a delay
                setTimeout( () => {
                    navigate( `/${ companyUserName }/my-jobs` );
                }, 2500 );

            } else {
                console.error( "Application submission failed:", result );
                alert( `Failed to submit application: ${ result.message || "Unknown error" }` );
            }

        } catch ( error ) {
            console.error( "Error submitting application:", error );
            alert( "An error occurred while submitting your application. Please try again." );
        } finally {
            setIsSubmitting( false );
        }
    };

    // If not logged in, don't render the form (useEffect will redirect)
    if (!loginData) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg text-center">
                <Lock size={32} className="text-red-600 mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Login Required</h3>
                <p className="text-gray-600 mb-4">Please log in to apply for this position</p>
                <button
                    onClick={() => navigate(`/${companyUserName}/login`, { state: { returnUrl: window.location.pathname } })}
                    className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-400 hover:text-black transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    if ( successMessage ) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg text-center">
                <CheckCircle size={ 32 } className="text-green-500 mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Application Submitted!</h3>
                <p className="text-gray-600 mb-2">{ successMessage }</p>
                { emailStatus && (
                    <p className="text-sm text-blue-600">{ emailStatus }</p>
                ) }
                <p className="text-gray-500 text-sm mt-2">Redirecting to your applications...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Application Status - Hidden from UI but still in form data */}
            <input type="hidden" {...register("applicationStatus")} />

            {/* Resume */}
            <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                    <FileText size={18} className="mr-2 text-blue-500" />
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
                    <div className="flex items-center justify-between px-4 py-3 border border-gray-300 border-dashed rounded-md bg-gray-50 text-gray-500">
                        <div className="flex items-center">
                            <FileUp size={18} className="mr-2" />
                            <span>{file ? file.name : "Upload your resume"}</span>
                        </div>
                        <span className="text-sm text-blue-500">Browse</span>
                    </div>
                </div>
                <p className="text-xs text-gray-500">PDF, DOCX, or RTF (Max 5MB)</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                    <Mail size={18} className="mr-2 text-blue-500" />
                    Contact Information
                </label>
                <input
                    type="number"
                    {...register("contactInfo", { required: true })}
                    placeholder="Phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
                {errors.contactInfo && (
                    <p className="flex items-center text-red-500 text-sm">
                        <AlertCircle size={14} className="mr-1" />
                        Contact information is required
                    </p>
                )}
            </div>
            {/* Email Info */ }
            <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                    <Mail size={ 18 } className="mr-2 text-blue-500" />
                    Email Information
                </label>
                <input
                    type="string"
                    { ...register( "emailInfo", { required: true } ) }
                    placeholder="Email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
                { errors.emailInfo && (
                    <p className="flex items-center text-red-500 text-sm">
                        <AlertCircle size={ 14 } className="mr-1" />
                        Contact information is required
                    </p>
                ) }
            </div>

            {/* Experience */}
            <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                    <Clock size={18} className="mr-2 text-blue-500" />
                    Relevant Experience
                </label>
                <textarea
                    {...register("experience", { required: true })}
                    placeholder="Briefly describe your relevant experience for this role"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            {job.applicationForm.question && job.applicationForm.question.length > 0 && (
                <div className="space-y-4">
                    <h2 className="flex items-center text-lg font-semibold text-gray-800 pb-2 border-b">
                        <User size={18} className="mr-2 text-blue-500" />
                        Application Questions
                    </h2>
                    {job.applicationForm.question.map((question, index) => (
                        <div key={index} className="space-y-2">
                            <label className="block text-gray-700 font-medium">
                                {question}
                            </label>
                            <textarea
                                {...register(`answers[${index}]`, { required: true })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Email Status */ }
            { emailStatus && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-700 text-sm">{ emailStatus }</p>
                </div>
            ) }

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-medium transition duration-200 ${isSubmitting
                    ? "bg-gradient-to-r from-gray-700 to-gray-100 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-400 hover:text-black transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                    }`}
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send size={18} className="mr-2" />
                        Apply Now
                    </>
                )}
            </button>
        </form>
    );
};