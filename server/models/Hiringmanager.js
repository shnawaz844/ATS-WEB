import mongoose from 'mongoose';

const HiringmanagerSchema = new mongoose.Schema({
    jobID: {
        type: String,
        required: true
    },
    hiringmanagerID: {
        type: String,
        required: true
    },
    feedbackForm:[{ 
        type: String
    }]
});

const Hiringmanager = mongoose.model( 'Hiringmanager', HiringmanagerSchema );

export default Hiringmanager;