import mongoose from "mongoose";

const FileSchema = new mongoose.Schema( {
    filename: {
        type: String,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    uploadDate: {
        type: Date,
        default: Date.now,
    },
    file: {
        type: String, // Store file binary
        required: true,
    },
} );

export default mongoose.models.File || mongoose.model( "File", FileSchema );