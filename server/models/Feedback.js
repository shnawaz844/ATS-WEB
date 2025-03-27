import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
    {
        interviewId: { type: String, ref: "InterviewSchedule", required: true },
        feedbackTitle: { type: String, required: true },
        feedback: { type: String, required: true },
        applicationID: { type: String, ref: "Application", required: true },
    },
    { timestamps: true }
);

const FeedbackModel = mongoose.model("Feedback", FeedbackSchema);

export default FeedbackModel;
