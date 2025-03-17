import mongoose from "mongoose";

const ApplicationTypeSchema = new mongoose.Schema( {
  applicationStep: {
    type: String,
    required: true,
  },
  applicationStatus: {
    type: String,
    required: true,
  },
  company_id: {
    type: String,
    required: true,
  },

},
  { timestamps: true }
);

const ApplicationType = mongoose.model(
  "ApplicationType",
  ApplicationTypeSchema
);

export default ApplicationType;
