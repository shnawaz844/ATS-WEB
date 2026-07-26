import Feedback from "../../models/Feedback.js";

export const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { feedbackTitle, feedback, applicationID, starRating } = req.body;

    console.log("Received feedbackId:", feedbackId);

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { feedbackTitle, feedback, applicationID, starRating }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ message: "Error updating feedback" });
  }
};
