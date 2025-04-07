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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },

},
  { timestamps: true }
);

const ApplicationType = mongoose.model(
  "ApplicationType",
  ApplicationTypeSchema
);

export default ApplicationType;
