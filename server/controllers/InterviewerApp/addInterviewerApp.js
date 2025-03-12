import InterviewerApp from "../../models/InterviewerApp.js";

const addInterviewerApp = async (req, res) => {
    const { applicationID, interviewerID, date, scheduledTime, interviewerType, meetingLink } = req.body;

    try {
        // Check if all required fields are provided
        if (!applicationID || !interviewerID || !date || !scheduledTime || !interviewerType || !meetingLink) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Create a new interview application entry
        const newApplication = new InterviewerApp({
            applicationID,
            interviewerID,
            date,
            scheduledTime,
            interviewerType,
            meetingLink
        });

        // Save the new entry to the database
        await newApplication.save();

        res.status(201).json({ message: "Interview scheduled successfully!", application: newApplication });
    } catch (error) {
        console.error("Error in addInterviewerApp:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export { addInterviewerApp };
