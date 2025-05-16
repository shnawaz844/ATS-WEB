import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
    {
        interviewId: { type: String, ref: "InterviewSchedule", required: true },
        feedbackTitle: { type: String, required: true },
        feedback: { type: String, required: true },
        applicationID: { type: String, ref: "Application", required: true },
        
        attachment: {
            type: String, // File path or URL
        },
        starRating: {
            type: Number,
            min: 1,
            max: 5,
        },
    },
    { timestamps: true }
);

const FeedbackModel = mongoose.model( "Feedback", FeedbackSchema );

export default FeedbackModel;
