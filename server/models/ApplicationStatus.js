import mongoose from "mongoose";

const ApplicationStatusSchema = new mongoose.Schema( {
  applicationStep: {
    type: String,
    required: true,
  },
  applicationStatus: {
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

const ApplicationStatus = mongoose.model(
  "Application-Status",
  ApplicationStatusSchema
);

export default ApplicationStatus;
