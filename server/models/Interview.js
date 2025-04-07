import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({

  roundName: {
    type: String,
    required: true
  },
  roundNumber: {
    type: String,
    required: true,
  },
  company_id:{
    type: String,
    required: true
  }
},
  { timestamps: true }
);

const Interview = mongoose.model('Interview', InterviewSchema);

export default Interview;