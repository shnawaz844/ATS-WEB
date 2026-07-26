import supabase from '../../config/supabaseClient.js';

// Email sending function (unchanged)
const sendInterviewScheduleEmail = async (candidateEmail, candidateName, jobTitle, interviewType, interviewDate, interviewTime, interviewLink) => {
  try {
    const formattedDate = interviewDate ? new Date(interviewDate).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }) : 'TBD';
    const displayTime = interviewTime || 'TBD';

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { accept: 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME },
        to: [{ email: candidateEmail, name: candidateName || 'Applicant' }],
        subject: `Interview Scheduled - ${jobTitle}`,
        htmlContent: `<!DOCTYPE html><html><body><h2>Interview Scheduled!</h2><p>Dear ${candidateName || 'Applicant'},</p><p>Your interview for <strong>${jobTitle}</strong> has been scheduled.</p><p><strong>Date:</strong> ${formattedDate}</p><p><strong>Time:</strong> ${displayTime}</p><p><strong>Type:</strong> ${interviewType === 'AI' ? 'AI-Powered' : 'Manual'} Interview</p>${interviewLink ? `<p><a href="${interviewLink}">Join Interview</a></p>` : ''}<p>Best regards,<br>Recruitment Team</p></body></html>`,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      return { success: true, messageId: result.messageId };
    } else {
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('Failed to send interview schedule email:', error);
    return { success: false, error: error.message };
  }
};

export const createInterview = async (req, res) => {
  try {
    const { applicationID, interviewerID, date, scheduledTime, interviewerType, meetingLink, status, roundID } = req.body;
    const { company_id } = req.headers;

    if (!applicationID || !interviewerType || !roundID) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Extract interview_id from meetingLink
    let interview_id = null;
    if (meetingLink) {
      const urlParts = meetingLink.split('/interview/');
      if (urlParts[1]) interview_id = urlParts[1].split('?')[0];
    }

    // Create interview schedule
    const { data: newInterview, error: createError } = await supabase
      .from('interview_schedules')
      .insert({
        applicationID,
        interviewerID: interviewerID || null,
        date: date || "",
        scheduledTime: scheduledTime || "",
        interviewerType,
        meetingLink: meetingLink || "",
        status: status || null,
        company_id, roundID,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Send email notification
    if (interview_id) {
      try {
        const { data: jobData } = await supabase
          .from('jobs')
          .select('title, "interviewMode"')
          .eq('interview_id', interview_id)
          .maybeSingle();

        const { data: applicationData } = await supabase
          .from('applications')
          .select('"emailInfo", "contactInfo", "candidateID"')
          .eq('id', applicationID)
          .maybeSingle();

        if (applicationData) {
          const { data: candidateData } = await supabase
            .from('users')
            .select('"userName", email')
            .eq('id', applicationData.candidateID)
            .maybeSingle();

          if (jobData && candidateData) {
            await sendInterviewScheduleEmail(
              applicationData.emailInfo, candidateData.userName,
              jobData.title, jobData.interviewMode,
              date, scheduledTime, meetingLink
            );
          }
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    res.status(201).json({
      message: 'Interview assigned successfully',
      interview: { ...newInterview, _id: newInterview.id }
    });
  } catch (error) {
    console.error('Error saving interview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default createInterview;
