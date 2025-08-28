import File from "../../models/ImportApplication.js";
import connectDB from "../../config/connectDB.js";
import upload, { uploadToS3 } from "../../middleware/upload.js";

export const uploadFile = async ( req, res ) => {
    console.log( "testconsole123", req );
    try {
        await connectDB();

        // Make sure file exists
        if ( !req.file ) {
            return res.status( 400 ).json( { error: "No file uploaded" } );
        }

        let fileUrl = null;
        console.log( "dtat11111" )
        if ( req.file ) {
            fileUrl = await uploadToS3( req.file );
        } else {
            return res.status( 400 ).json( { message: "Resume file is required." } );
        }

        const fileData = {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            file: fileUrl, // Upload to S3 and store the URL
        };

        console.log( "fileData", fileData );
        const newFile = new File( fileData );
        await newFile.save();

        res.status( 200 ).json( { message: "File uploaded successfully", fileId: newFile._id } );
    } catch ( error ) {
        console.error( "Error uploading file:", error );
        res.status( 500 ).json( { error: "Failed to upload file" } );
    }
};
export default uploadFile;

// ADD THIS NEW FUNCTION for fetching user files
export const getUserFiles = async ( req, res ) => {
    try {
        await connectDB();

        // Fetch all files from database
        const files = await File.find( {} ).sort( { uploadDate: -1 } );

        // Transform the data to match frontend expectations
        const transformedFiles = files.map( file => ( {
            id: file._id,
            fileName: file.filename,
            fileSize: file.size,
            fileUrl: file.file,
            uploadDate: file.uploadDate,
            userName: 'Current User' // Modify based on your user system
        } ) );

        console.log( "Fetched files:", transformedFiles );

        res.status( 200 ).json( {
            files: transformedFiles,
            total: transformedFiles.length
        } );
    } catch ( error ) {
        console.error( "Error fetching user files:", error );
        res.status( 500 ).json( { error: "Failed to fetch user files" } );
    }
};

export const getFile = async ( req, res ) => {
    try {
        await connectDB();

        const file = await File.findById( req.query.id );
        if ( !file ) {
            return res.status( 404 ).json( { error: "File not found" } );
        }

        res.setHeader( "Content-Type", file.mimetype );
        res.send( file.file );
    } catch ( error ) {
        console.error( "Error fetching file:", error );
        res.status( 500 ).json( { error: "Failed to fetch file" } );
    }
};

export { upload };