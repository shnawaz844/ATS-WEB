import InterviewSchedule from "../../models/Applicationlist.js";

export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInterview = await InterviewSchedule.findByIdAndDelete(id);

    if (!deletedInterview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.status(200).json({ message: "Interview deleted successfully" });
  } catch (error) {
    console.error("Error deleting interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
