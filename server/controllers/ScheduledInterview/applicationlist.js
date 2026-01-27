import Application from "../../models/Application.js";
import InterviewSchedule from "../../models/Applicationlist.js";
import Job from "../../models/Job.js";
import User from "../../models/User.js";

// Email sending function
const sendInterviewScheduleEmail = async (
  candidateEmail,
  candidateName,
  jobTitle,
  interviewType,
  interviewDate,
  interviewTime,
  interviewLink
) => {
  try {
    // Format date for display
    const formattedDate = new Date(interviewDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

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
            email: candidateEmail,
            name: candidateName || "Applicant",
          },
        ],
        subject: `Interview Scheduled - ${jobTitle}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  line-height: 1.6; 
                  color: #333; 
                  margin: 0;
                  padding: 0;
                  background-color: #f5f7fa;
                }
                .container { 
                  max-width: 600px; 
                  margin: 30px auto; 
                  background-color: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .header { 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white; 
                  padding: 40px 30px; 
                  text-align: center;
                }
                .header-icon {
                  font-size: 48px;
                  margin-bottom: 15px;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: 700;
                }
                .content { 
                  padding: 40px 35px;
                }
                .greeting {
                  font-size: 18px;
                  color: #2d3748;
                  margin: 0 0 20px 0;
                }
                .message {
                  font-size: 16px;
                  color: #4a5568;
                  margin: 0 0 30px 0;
                  line-height: 1.8;
                }
                .interview-details { 
                  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
                  padding: 30px;
                  border-radius: 10px;
                  margin: 30px 0;
                  border-left: 5px solid #667eea;
                }
                .interview-details h2 {
                  margin: 0 0 20px 0;
                  color: #2d3748;
                  font-size: 20px;
                  font-weight: 600;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                }
                .detail-item {
                  background: #ffffff;
                  padding: 15px 20px;
                  margin: 12px 0;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                }
                .detail-icon {
                  font-size: 24px;
                  margin-right: 15px;
                  min-width: 30px;
                  text-align: center;
                }
                .detail-text {
                  flex: 1;
                }
                .detail-label {
                  font-size: 12px;
                  color: #718096;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  font-weight: 600;
                  margin: 0 0 5px 0;
                }
                .detail-value {
                  font-size: 16px;
                  color: #2d3748;
                  font-weight: 600;
                  margin: 0;
                }
                .cta-section {
                  text-align: center;
                  margin: 35px 0;
                  padding: 30px 20px;
                  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                  border-radius: 10px;
                  border: 2px solid #22c55e;
                }
                .cta-section p {
                  color: #166534;
                  margin: 0 0 20px 0;
                  font-size: 15px;
                  font-weight: 500;
                }
                .button { 
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white !important;
                  padding: 16px 40px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 700;
                  font-size: 16px;
                  transition: all 0.3s ease;
                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
                }
                .note {
                  background-color: #fef3c7;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 25px 0;
                  border-left: 4px solid #f59e0b;
                }
                .note p {
                  color: #92400e;
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.6;
                }
                .footer { 
                  text-align: center;
                  padding: 25px;
                  background-color: #f8fafc;
                  color: #64748b;
                  font-size: 13px;
                  border-top: 1px solid #e2e8f0;
                }
                .footer p {
                  margin: 5px 0;
                  color: #64748b;
                }
                .divider {
                  height: 2px;
                  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
                  margin: 30px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="header-icon">📅</div>
                  <h1>Interview Scheduled!</h1>
                </div>
                
                <div class="content">
                  <p class="greeting">Dear <strong>${candidateName || "Applicant"}</strong>,</p>
                  
                  <p class="message">
                    We are pleased to inform you that your interview has been scheduled for the <strong>${jobTitle}</strong> position.
                  </p>
                  
                  <div class="interview-details">
                    <h2><span>📋</span> Interview Details</h2>
                    
                    <div class="detail-item">
                      <div class="detail-icon">💼</div>
                      <div class="detail-text">
                        <p class="detail-label">Position</p>
                        <p class="detail-value">${jobTitle}</p>
                      </div>
                    </div>
                    
                    <div class="detail-item">
                      <div class="detail-icon">📅</div>
                      <div class="detail-text">
                        <p class="detail-label">Date</p>
                        <p class="detail-value">${formattedDate}</p>
                      </div>
                    </div>
                    
                    <div class="detail-item">
                      <div class="detail-icon">🕐</div>
                      <div class="detail-text">
                        <p class="detail-label">Time</p>
                        <p class="detail-value">${interviewTime}</p>
                      </div>
                    </div>
                    
                    <div class="detail-item">
                      <div class="detail-icon">${interviewType === 'AI' ? '🤖' : '👤'}</div>
                      <div class="detail-text">
                        <p class="detail-label">Interview Type</p>
                        <p class="detail-value">${interviewType === 'AI' ? 'AI-Powered Interview' : 'Manual Interview'}</p>
                      </div>
                    </div>
                  </div>

                  <div class="cta-section">
                    <p>Click the button below to join your interview at the scheduled time:</p>
                    <a href="${interviewLink}" class="button">
                      Join Interview
                    </a>
                  </div>

                  <div class="note">
                    <p>
                      <strong>📌 Important:</strong> Please join the interview 5 minutes before the scheduled time. 
                      Make sure you have a stable internet connection and test your microphone and camera beforehand.
                    </p>
                  </div>

                  <div class="divider"></div>

                  <p class="message">
                    If you have any questions or need to reschedule, please contact us as soon as possible.
                  </p>
                  
                  <p class="message">We look forward to speaking with you!</p>
                  
                  <p style="margin-top: 30px; color: #2d3748;">
                    Best regards,<br>
                    <strong>Recruitment Team</strong><br>
                  </p>
                </div>
                
                <div class="footer">
                  <p>This is an automated message. Please do not reply directly to this email.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Interview schedule email sent successfully:", result);
      return { success: true, messageId: result.messageId };
    } else {
      console.error("❌ Brevo API error:", result);
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error("❌ Failed to send interview schedule email:", error);
    return { success: false, error: error.message };
  }
};

// Updated createInterview function with email integration
export const createInterview = async (req, res) => {
  try {
    const { applicationID, interviewerID, date, scheduledTime, interviewerType, meetingLink, status, roundID } = req.body;
    const { company_id } = req.headers;

    // Validate required fields
    if (!applicationID || !date || !scheduledTime || !interviewerType || !roundID) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Extract interview_id from meetingLink
    // Example: http://localhost:4000/interview/d2d292aa-5fd6-4a6c-8358-d04061af73af?date=2026-01-26&time=09:30
    let interview_id = null;
    if (meetingLink) {
      const urlParts = meetingLink.split('/interview/');
      if (urlParts[1]) {
        interview_id = urlParts[1].split('?')[0];
      }
    }

    // Create new interview
    const newInterview = new InterviewSchedule({
      applicationID,
      interviewerID: interviewerID || null,
      date,
      scheduledTime,
      interviewerType,
      meetingLink,
      status: status || null,
      company_id,
      roundID,
    });

    await newInterview.save();

    // Fetch job data using interview_id
    if (interview_id) {
        console.log("Interview_id", interview_id)
      try {
        const jobData = await Job.findOne({ interview_id: interview_id }).select(
          "title interviewMode"
        );

        // Fetch application and candidate data
        const applicationData = await Application.findById(applicationID).select(
          "emailInfo contactInfo candidateID"
        );

        const candidateData = await User.findById(applicationData.candidateID).select(
          "userName email"
        );

        console.log("jobdata", jobData)
        console.log("applicationData", applicationData)
        console.log("candidateData", candidateData)

        if (jobData && candidateData) {
          // Send email notification
          await sendInterviewScheduleEmail(
            applicationData.emailInfo,
            candidateData.userName,
            jobData.title,
            jobData.interviewMode,
            date,
            scheduledTime,
            meetingLink
          );
        }
      } catch (emailError) {
        console.error("❌ Error sending email:", emailError);
        // Don't fail the interview creation if email fails
      }
    }

    res.status(201).json({ 
      message: "Interview assigned successfully", 
      interview: newInterview 
    });

  } catch (error) {
    console.error("Error saving interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default createInterview;
