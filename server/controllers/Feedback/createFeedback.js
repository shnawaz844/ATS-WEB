import FeedbackModel from "../../models/Feedback.js";

export const createFeedback = async (req, res) => {
  try {
    const { feedbackTitle, feedback, interviewId, applicationID, starRating } = req.body;
    console.log("feedback", feedbackTitle, feedback, interviewId, req.body)

    const newFeedback = await FeedbackModel.create({
      interviewId,
      feedbackTitle,
      feedback,
      applicationID,
      starRating
    });

    res.status(201).json(newFeedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating feedback" });
  }
};