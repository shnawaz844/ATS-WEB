import InterviewerApp from "../../models/InterviewerApp.js";

const addInterviewerApp = async (req, res) => {
  const { applicationID, interviewerID, date, scheduledTime, interviewerType, meetingLink } = req.body;

  try {
    if (!applicationID || !interviewerID || !date || !scheduledTime || !interviewerType || !meetingLink) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newApplication = await InterviewerApp.create({
      applicationID,
      interviewerID,
      date,
      scheduledTime,
      interviewerType,
      meetingLink
    });

    res.status(201).json({ message: "Interview scheduled successfully!", application: newApplication });
  } catch (error) {
    console.error("Error in addInterviewerApp:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export { addInterviewerApp };
