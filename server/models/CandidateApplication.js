// models/CandidateFile.js

import mongoose from "mongoose";

const candidateFileSchema = new mongoose.Schema( {
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
    },
    mimetype: {
        type: String,
    },
    size: {
        type: Number,
    },
    fileUrl: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    companyId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        default: 'Unknown User'
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    totalCandidates: {
        type: Number,
        default: 0
    },
    processedCandidates: {
        type: Number,
        default: 0
    },
    failedCandidates: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: [ 'processing', 'completed', 'failed', 'partial' ],
        default: 'processing'
    },
    processingErrors: [ {
        row: Number,
        error: String,
        candidateData: Object
    } ]
}, {
    timestamps: true
} );

// Create index for better query performance
candidateFileSchema.index( { userId: 1, companyId: 1 } );
candidateFileSchema.index( { uploadDate: -1 } );

const CandidateFile = mongoose.model( "Candidate-File", candidateFileSchema );

export default CandidateFile;