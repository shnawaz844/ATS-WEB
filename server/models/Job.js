import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    jobID: {
      type: String,
      required: true,
    },
    titleCode: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    locationType: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    scheduleType: {
      type: String,
      required: true,
    },
    shiftStart: {
      type: String,
      required: function () {
        return this.scheduleType !== "Flexible";
      },
    },
    shiftEnd: {
      type: String,
      required: function () {
        return this.scheduleType !== "Flexible";
      },
    },
    hireType: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: function () {
        return this.locationType !== "Remote";
      },
    },
    city: {
      type: String,
      required: function () {
        return this.locationType !== "Remote";
      },
    },
    description: {
      type: String,
      required: true,
    },
    compensation: {
      type: String,
      required: true,
    },
    experienceRequired: {
      type: String,
      required: true,
    },
    requiredResources: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    recruiterId: {
      type: String,
      required: true,
    },
    hiringManagerId: {
      type: String,
      required: true,
    },
    applicationForm: {
      question: [{ type: String }],
      answer: [{ type: String }],
    },
    applicants: [
      {
        applicant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          default: "active",
        },
      },
    ],
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    interview_id: { type: String, required: false },
    interviewMode: {
      type: String,
      enum: ['AI', 'Manual'],
      required: false,
    },
    interviewType: {
      roundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview", // Reference to your Interview Round model
        required: false,
      },
      roundName: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true },
);

const Job = mongoose.model("Job", JobSchema);

export default Job;
