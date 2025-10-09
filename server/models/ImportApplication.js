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
        type: String, // Store S3 URL or file binary
        required: true,
    },
    // New fields for user and company association
    userId: {
        type: String,
        required: true,
        index: true, // Add index for faster queries
    },
    companyId: {
        type: String,
        required: true,
        index: true, // Add index for faster queries
    },
    userName: {
        type: String,
        default: 'Unknown User',
    },
    // Optional metadata fields
    fileType: {
        type: String,
        enum: [ 'csv', 'xlsx', 'xls', 'other' ],
        default: function () {
            const ext = this.filename.split( '.' ).pop().toLowerCase();
            return [ 'csv', 'xlsx', 'xls' ].includes( ext ) ? ext : 'other';
        }
    },
    fileCategory: {
        type: String,
        enum: [ 'application', 'report', 'data', 'other' ],
        default: 'application'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [ {
        type: String,
        trim: true
    } ],
    description: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true // This adds createdAt and updatedAt fields automatically
} );

// Compound indexes for efficient querying
FileSchema.index( { userId: 1, companyId: 1 } );
FileSchema.index( { companyId: 1, uploadDate: -1 } );
FileSchema.index( { userId: 1, uploadDate: -1 } );

// Pre-save middleware to set fileType based on filename
FileSchema.pre( 'save', function ( next ) {
    if ( this.filename ) {
        const ext = this.filename.split( '.' ).pop().toLowerCase();
        if ( [ 'csv', 'xlsx', 'xls' ].includes( ext ) ) {
            this.fileType = ext;
        }
    }
    next();
} );

// Virtual field for formatted file size
FileSchema.virtual( 'formattedSize' ).get( function () {
    if ( this.size === 0 ) return '0 Bytes';
    const k = 1024;
    const sizes = [ 'Bytes', 'KB', 'MB', 'GB' ];
    const i = Math.floor( Math.log( this.size ) / Math.log( k ) );
    return parseFloat( ( this.size / Math.pow( k, i ) ).toFixed( 2 ) ) + ' ' + sizes[ i ];
} );

// Static method to find files by company
FileSchema.statics.findByCompany = function ( companyId, options = {} ) {
    return this.find( {
        companyId: companyId,
        isActive: true
    } ).sort( options.sort || { uploadDate: -1 } );
};

// Static method to find files by user
FileSchema.statics.findByUser = function ( userId, companyId = null, options = {} ) {
    const query = { userId: userId, isActive: true };
    if ( companyId ) query.companyId = companyId;

    return this.find( query ).sort( options.sort || { uploadDate: -1 } );
};

// Instance method to soft delete
FileSchema.methods.softDelete = function () {
    this.isActive = false;
    return this.save();
};

// Instance method to check if user has access
FileSchema.methods.hasAccess = function ( userId, companyId ) {
    return this.userId === userId && this.companyId === companyId;
};

export default mongoose.models.File || mongoose.model( "File", FileSchema );