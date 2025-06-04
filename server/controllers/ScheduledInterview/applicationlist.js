import InterviewSchedule from "../../models/Applicationlist.js";

// Function to create an interview
export const createInterview = async (req, res) => {
    try {
        const { applicationID, interviewerID, date, scheduledTime, interviewerType, meetingLink, status,roundID } = req.body;
        const { company_id } = req.headers;

        // Validate required fields
        if ( !applicationID || !interviewerID || !date || !scheduledTime || !interviewerType || !status || !roundID) {
            return res.status(400).json({ message: "All fields are required" });
        }
        console.log( "status", status )

        const newInterview = new InterviewSchedule({
            applicationID,
            interviewerID,
            date,
            scheduledTime,
            interviewerType,
            meetingLink,
            status,
            company_id,
            roundID,
        });

        await newInterview.save();
        res.status(201).json({ message: "Interview assigned successfully", interview: newInterview });

    } catch (error) {
        console.error("Error saving interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export default createInterview;
