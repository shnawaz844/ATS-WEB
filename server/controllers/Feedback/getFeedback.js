import Feedback from "../../models/Feedback.js";

export const getFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;
    console.log("Fetching feedback for Interview ID:", interviewId);

    const feedback = await Feedback.findOne({ interviewId });

    if (!feedback) {
      console.log("No feedback found for ID:", interviewId);
      return res.status(404).json({ message: "No feedback found" });
    }

    console.log("Feedback found:", feedback);
    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};
