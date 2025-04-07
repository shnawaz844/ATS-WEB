import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
    {
        applicationID: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
        interviewerID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        date: { type: String, required: true },
        scheduledTime: { type: String, required: true },
        interviewerType: { type: String, required: true },
        meetingLink: { type: String },
        status: { type: String },
        reasonRescheduled: {
            type: String, required: function () {
                return this.status === 'rescheduled';
            }
        },
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",  // Assuming you have a "Company" model
            required: true  // Set to true if company_id is mandatory for every interview
        },

    },
    { timestamps: true } // Adds createdAt and updatedAt timestamps
);

const InterviewSchedule = mongoose.model("InterviewSchedule", InterviewSchema);
export default InterviewSchedule;
