import InterviewSchedule from "../../models/Applicationlist.js";

// Function to create an interview
export const createInterview = async (req, res) => {
    try {
        const { applicationID, interviewerID, date, scheduledTime, interviewerType, meetingLink } = req.body;

        // Validate required fields
        if (!applicationID || !interviewerID || !date || !scheduledTime || !interviewerType ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newInterview = new InterviewSchedule({
            applicationID,
            interviewerID,
            date,
            scheduledTime,
            interviewerType,
            meetingLink,
        });

        await newInterview.save();
        res.status(201).json({ message: "Interview assigned successfully", interview: newInterview });

    } catch (error) {
        console.error("Error saving interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export default createInterview;
