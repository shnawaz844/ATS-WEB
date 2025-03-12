import mongoose from 'mongoose';

const InterviewerAppSchema = new mongoose.Schema({
    applicationID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Job'
    },
    interviewerID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    date: {
        type: Date,
        required: true
    },
    scheduledTime: {
        type: String, // Or use Date if it's a full timestamp
        required: true
    },
    interviewerType: {
        type: String,
        required: true
    },
    meetingLink: {
        type: String,
        required: true
    }
});

const InterviewerApp = mongoose.model('InterviewerApp', InterviewerAppSchema);

export default InterviewerApp;
