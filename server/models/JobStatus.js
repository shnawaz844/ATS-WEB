import mongoose from "mongoose";

const JobStatusSchema = new mongoose.Schema( {
  jobStep: {
    type: String,
    required: true,
  },
  jobStatus: {
    type: String,
    required: true,
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },

},
  { timestamps: true }
);

const JobStatus = mongoose.model(
  "Job-Status",
  JobStatusSchema
);

export default JobStatus;
