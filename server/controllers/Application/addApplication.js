import Application from "../../models/Application.js";
import upload, { uploadToS3 } from "../../middleware/upload.js";
import Job from "../../models/Job.js";
import jwt from "jsonwebtoken";
import supabase from "../../config/supabaseClient.js";

const isUUID = (str) => typeof str === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

const generateInterviewToken = ({ applicationId, companyId, roundId }) => {
  return jwt.sign(
    {
      applicationId,
      companyId,
      roundId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "48h",
    }
  );
}

const sendApplicationConfirmationEmail = async (
  applicationData,
  jobData,
  candidateData,
) => {
  try {
    let interviewScheduleUrl;

    if (jobData.interviewMode == "AI") {
      const token = generateInterviewToken({
        applicationId: applicationData.applicationId,
        companyId: jobData.company_id,
        roundId: jobData.interviewType
      });

      interviewScheduleUrl =
        `${process.env.ASTRANYX_AI}/interview/${jobData.interview_id}/schedule-interview?token=${token}`;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL,
          name: process.env.BREVO_SENDER_NAME,
        },
        to: [
          {
            email: applicationData.emailInfo,
            name: candidateData.name || "Applicant",
          },
        ],
        subject: `Application Received - ${jobData.title}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  line-height: 1.6; 
                  color: #333; 
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                }
                .container { 
                  max-width: 600px; 
                  margin: 20px auto; 
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header { 
                  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
                  color: white; 
                  padding: 30px 20px; 
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: 600;
                }
                .content { 
                  padding: 40px 30px;
                  background-color: #ffffff;
                }
                .content p {
                  margin: 0 0 15px 0;
                  color: #555;
                }
                .details { 
                  background-color: #f9fafb;
                  padding: 20px;
                  border-left: 4px solid #9333ea;
                  margin: 25px 0;
                  border-radius: 4px;
                }
                .details h3 {
                  margin: 0 0 15px 0;
                  color: #9333ea;
                  font-size: 18px;
                }
                .details p {
                  margin: 8px 0;
                  color: #555;
                }
                .interview-section {
                  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                  padding: 25px;
                  border-radius: 8px;
                  margin: 30px 0;
                  text-align: center;
                  border: 2px solid #22c55e;
                }
                .interview-section h3 {
                  color: #16a34a;
                  margin: 0 0 10px 0;
                  font-size: 20px;
                }
                .interview-section p {
                  color: #166534;
                  margin: 0 0 20px 0;
                  font-size: 15px;
                }
                .button { 
                  display: inline-block;
                  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
                  color: white !important;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                  font-size: 16px;
                  transition: transform 0.2s, box-shadow 0.2s;
                  box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
                }
                .button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 12px rgba(147, 51, 234, 0.4);
                }
                .next-steps {
                  background-color: #fef3c7;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 25px 0;
                  border-left: 4px solid #f59e0b;
                }
                .next-steps h3 {
                  color: #d97706;
                  margin: 0 0 15px 0;
                  font-size: 18px;
                }
                .next-steps ul {
                  margin: 10px 0;
                  padding-left: 20px;
                  color: #92400e;
                }
                .next-steps li {
                  margin: 8px 0;
                }
                .footer { 
                  text-align: center;
                  padding: 20px;
                  background-color: #f9fafb;
                  color: #6b7280;
                  font-size: 13px;
                  border-top: 1px solid #e5e7eb;
                }
                .footer p {
                  margin: 5px 0;
                  color: #6b7280;
                }
                .divider {
                  height: 1px;
                  background-color: #e5e7eb;
                  margin: 25px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Application Received!</h1>
                </div>
                
                <div class="content">
                  <p>Dear <strong>${candidateData.name || "Applicant"}</strong>,</p>
                  
                  <p>Thank you for applying to the <strong>${jobData.title}</strong> position${jobData.companyName ? ` at ${jobData.companyName}` : " at our company"}. We're excited to review your application!</p>
                  
                  <div class="details">
                    <h3>📋 Application Details</h3>
                    <p><strong>Position:</strong> ${jobData.title}</p>
                    <p><strong>Application Date:</strong> ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                    <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">Submitted ✓</span></p>
                    <p><strong>Contact:</strong> ${applicationData.contactInfo}</p>
                    <p><strong>Email:</strong> ${applicationData.emailInfo}</p>
                  </div>

                 ${jobData.interviewMode === "AI" && jobData.interview_id
            ? `
  <div class="interview-section">
    <h3>🎯 Next Step: Schedule Your Interview</h3>
    <p>Great news! We'd like to invite you to schedule an AI-powered interview.</p>
    <p>Click the button below to choose a convenient time slot:</p>
    <a href="${interviewScheduleUrl}" class="button">
      📅 Schedule Interview
    </a>
    <p style="margin-top: 15px; font-size: 13px; color: #166534;">
      Please schedule your interview within the next 48 hours to secure your preferred time slot.
    </p>
  </div>
  `
            : `
  <div class="interview-section" style="border-color:#f59e0b;background:#fff7ed;">
    <h3 style="color:#d97706;">📞 Next Step</h3>
    <p style="color:#92400e;">
      Our HR team will review your application and reach out to you directly if you're shortlisted.
    </p>
  </div>
  `
          }

                  <div class="divider"></div>

                  <div class="next-steps">
                    <h3>📍 What Happens Next?</h3>
                    <ul>
                      <li>Our recruitment team will review your application carefully</li>
                        ${jobData.interviewMode === "AI"
            ? "<li><strong>Schedule your interview using the button above</strong></li>"
            : "<li>Our HR team will contact you if you're shortlisted</li>"
          }
                      <li>You can expect to hear from us within 5-7 business days</li>
                      <li>We'll keep you updated on your application status via email</li>
                    </ul>
                  </div>

                  <div class="divider"></div>

                  <p>If you have any questions or need to update your application, please don't hesitate to reach out to us.</p>
                  
                  <p style="margin-top: 30px;">Best regards,<br>
                  <strong>The Recruitment Team</strong><br>
                  ${jobData.companyName || "Our Company"}</p>
                </div>
                
                <div class="footer">
                  <p>This is an automated message. Please do not reply directly to this email.</p>
                  <p>© ${new Date().getFullYear()} ${jobData.companyName || "Company"}. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Email sent successfully via Brevo API:", result);
      return { success: true, messageId: result.messageId };
    } else {
      console.error("❌ Brevo API error:", result);
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return { success: false, error: error.message };
  }
};

const addApplication = async (req, res) => {
  console.log("Processing application submission");
  const {
    jobID,
    candidateID,
    applicationStatusId,
    contactInfo,
    emailInfo,
    experience,
    questions,
    answers,
    company_id,
    jobStatusId,
    interview_id,
    interviewMode,
    interviewType,
    companyUserName,
    candidateName,
    fullName,
    qualification,
    city,
    relocate,
    hasExperience,
    experiences,
    willingToWorkShift,
    whyJoin,
    hasReferral,
    referralName,
    referralDesignation,
    referralDepartment,
    referralCode,
    certificationDetails
  } = req.body;

  try {
    if (
      !jobID ||
      !candidateID ||
      !applicationStatusId ||
      !contactInfo ||
      !emailInfo ||
      !experience ||
      !company_id ||
      !jobStatusId
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Check if applicant has already applied for this specific job
    const existingApplication = await Application.findOne({ candidateID, jobID });
    if (existingApplication) {
      return res.status(400).json({ message: "You have already submitted an application for this position." });
    }

    let resumeUrl = null;
    let certUrl = null;

    const resumeFile = req.files && req.files['resume'] ? req.files['resume'][0] : req.file;
    const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : (req.files && req.files['certFile'] ? req.files['certFile'][0] : null);

    if (resumeFile) {
      const uploadResult = await uploadToS3(resumeFile);
      resumeUrl = uploadResult.fileUrl;
    } else {
      return res.status(400).json({ message: "Resume file is required." });
    }

    if (certFile) {
      try {
        const certUploadResult = await uploadToS3(certFile);
        certUrl = certUploadResult.fileUrl;
      } catch (e) {
        console.warn("⚠️ Certificate upload failed:", e.message);
      }
    }

    // Format additional stepper details into experience text so full data is preserved in Supabase
    let formattedExperience = experience || "";
    const extraDetails = [];
    if (fullName) extraDetails.push(`Name: ${fullName}`);
    if (qualification) extraDetails.push(`Qualification: ${qualification}`);
    if (city) extraDetails.push(`City: ${city}`);
    if (relocate !== undefined && relocate !== null) extraDetails.push(`Relocate: ${relocate}`);

    if (experiences) {
      let expList = [];
      try {
        const parsed = typeof experiences === 'string' ? JSON.parse(experiences) : experiences;
        if (Array.isArray(parsed) && parsed.length > 0) {
          expList = parsed.map((b, i) => `Exp ${i + 1}: ${b.years || 0} yrs in ${b.field || 'Field'} at ${b.company || 'Company'} as ${b.role || 'Role'} (Salary: ${b.salary || 'N/A'})`);
        }
      } catch (e) { }
      if (expList.length > 0) {
        extraDetails.push(`Work Experiences: ${expList.join(" ; ")}`);
      }
    }

    if (willingToWorkShift !== undefined && willingToWorkShift !== null) extraDetails.push(`Flexible Shift: ${willingToWorkShift}`);
    if (whyJoin) extraDetails.push(`Why Join: ${whyJoin}`);

    if (certificationDetails) {
      try {
        const certParsed = typeof certificationDetails === 'string' ? JSON.parse(certificationDetails) : certificationDetails;
        extraDetails.push(`Certificate: ${certParsed.subject || ''} from ${certParsed.place || ''} (Marks: ${certParsed.marks || ''})`);
      } catch (e) { }
    }
    if (certUrl) extraDetails.push(`Certificate File: ${certUrl}`);

    if (hasReferral === "true" || hasReferral === true) {
      extraDetails.push(`Referral: Yes - ${referralName || 'Employee'} (${referralDesignation || ''} in ${referralDepartment || ''} - Code: ${referralCode || 'N/A'})`);
    } else if (hasReferral === "false" || hasReferral === false) {
      extraDetails.push(`Referral: No`);
    } else if (referralName) {
      extraDetails.push(`Referral: ${referralName} (${referralDesignation || ''} in ${referralDepartment || ''} - Code: ${referralCode || 'N/A'})`);
    }

    if (extraDetails.length > 0) {
      formattedExperience = `${formattedExperience ? formattedExperience + " | " : ""}Details: ${extraDetails.join(" | ")}`;
    }

    const newApplication = await Application.create({
      jobID,
      candidateID,
      applicationStatusId,
      jobStatusId,
      resume: resumeUrl,
      contactInfo,
      emailInfo,
      "candidate-info": formattedExperience,
      qualification,
      city,
      relocate,
      willingToWorkShift,
      whyJoin,
      hasReferral: hasReferral !== undefined ? String(hasReferral) : null,
      referralName,
      referralDesignation,
      referralDepartment,
      experiences: typeof experiences === 'string' ? experiences : JSON.stringify(experiences || []),
      questions: typeof questions === 'string' ? JSON.parse(questions) : (questions || []),
      answers: typeof answers === 'string' ? JSON.parse(answers) : (answers || []),
      company_id,
      interview_id: interview_id || null,
      EmployeeCode: referralCode || null,
      certificationDetails: (() => {
        let certObj = certificationDetails ? (typeof certificationDetails === 'string' ? JSON.parse(certificationDetails) : certificationDetails) : null;
        if (certObj && certUrl) {
          certObj.fileUrl = certUrl;
        }
        return certObj;
      })(),
    });

    const applicationId = newApplication._id;
    console.log("✅ Application saved to database:", applicationId);

    const isUUID = (str) => typeof str === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

    let jobData = null;
    try {
      if (jobID) {
        jobData = await Job.findById(jobID);
        if (jobData) {
          const actualJobId = jobData.id; // Correct UUID from DB
          const existingApplicationsCount = await Application.countDocuments({ jobID });

          let updateData = {};

          // Status update
          if (existingApplicationsCount === 1 && jobStatusId) {
            updateData.status = jobStatusId;
          }

          // Update applicants (JSONB array in Supabase)
          let currentApplicants = Array.isArray(jobData.applicants) ? jobData.applicants : [];
          updateData.applicants = [...currentApplicants, candidateID];

          await Job.findByIdAndUpdate(actualJobId, updateData);

          jobData = { ...jobData, ...updateData };
        }
      }
    } catch (err) {
      console.warn("⚠️ Job lookup or update failed:", err.message);
    }
    const candidateData = { name: candidateName || "Applicant" };

    sendApplicationConfirmationEmail(
      { emailInfo, contactInfo, experience, applicationId },
      {
        title: jobData?.title,
        companyName: companyUserName,
        company_id,
        interview_id: jobData?.interview_id,
        description: jobData?.description,
        interviewMode,
        interviewType: jobData?.interviewType?.roundId,
      },
      candidateData,
    ).then((emailResult) => {
      if (emailResult.success) {
        console.log(
          "✅ Confirmation email sent with interview scheduling link",
        );
      } else {
        console.error(
          "⚠️ Email failed but application was saved:",
          emailResult.error,
        );
      }
    });

    res.status(201).json({
      message: "Application submitted successfully!",
      application: newApplication,
      interviewSchedulingAvailable: !!jobData?.interview_id,
    });
  } catch (error) {
    console.error("Error in addApplication:", error);
    res.status(500).json({ message: error.message });
  }
};

export { upload, addApplication };
