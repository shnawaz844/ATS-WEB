import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({

    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "recruiter_manager", "hiring_manager", "interviewer", "candidate"],
        default: "candidate"
    },
    head: {
        type: Boolean,
        default: false
    },
    company_id: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

export default User;