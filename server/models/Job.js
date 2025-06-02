import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    jobID: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    locationType: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    scheduleType: {
        type: String,
        required: true
    },
    shiftStart: {
        type: String,
        required: true
    },
    shiftEnd: {
        type: String,
        required: true
    },
    hireType: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    compensation: {
        type: String,
        required: true
    },
    experienceRequired: {
        type: String,
        required: true
    },
    requiredResources: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    recruiterId: {
        type: String,
        required: true
    },
    hiringManagerId: {
        type: String,
        required: true
    },
    applicationForm: {
        question: [{ type: String }],
        answer: [{ type: String }]
    },
    applicants: [{
        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            default: 'active'
        }
    }],
    company_id: { type: String, required: true }

}, { timestamps: true } );

const Job = mongoose.model('Job', JobSchema);

export default Job;