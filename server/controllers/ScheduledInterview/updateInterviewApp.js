import InterviewSchedule from "../../models/Applicationlist.js";

export const updateInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, scheduledTime, interviewerType, meetingLink, interviewerID } = req.body;

        console.log("id", id)

        const updatedInterview = await InterviewSchedule.findByIdAndUpdate(
            id,
            { date, scheduledTime, interviewerType, meetingLink, interviewerID },
            { new: true } // Returns the updated document
        );

        if (!updatedInterview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        res.status(200).json({ message: "Interview updated successfully", interview: updatedInterview });
    } catch (error) {
        console.error("Error updating interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
