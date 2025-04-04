import FeedbackModel from "../../models/Feedback.js";

export const createFeedback = async (req, res) => {
    try {
        // const { interviewId } = req.params;
        const { feedbackTitle, feedback, interviewId, applicationID } = req.body;
        console.log("feedback", feedbackTitle, feedback, interviewId, req.body)

        const newFeedback = new FeedbackModel({ interviewId, feedbackTitle, feedback, applicationID });
        await newFeedback.save();

        res.status(201).json(newFeedback);
    } catch (error) {
        res.status(500).json({ message: "Error creating feedback" });
    }
};