import Company from '../../models/company.js';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import path from 'path';
import { uploadToS3 } from '../../middleware/upload.js';

// Configure AWS SDK
const s3 = new AWS.S3( {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
} );

// Configure multer to use S3
const upload = multer( {
    storage: multerS3( {
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        acl: 'public-read',
        metadata: function ( req, file, cb ) {
            cb( null, { fieldName: file.fieldname } );
        },
        key: function ( req, file, cb ) {
            const uniqueSuffix = Date.now() + '-' + Math.round( Math.random() * 1E9 );
            const extension = path.extname( file.originalname );
            cb( null, `companies/${ uniqueSuffix }${ extension }` );
        }
    } ),
    fileFilter: ( req, file, cb ) => {
        if ( file.mimetype.startsWith( 'image/' ) ) {
            cb( null, true );
        } else {
            cb( new Error( 'Only image files are allowed!' ), false );
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
} );

const addCompany = async ( req, res ) => {
    try {
        console.log( "Body", req.body );
        const { CompanyUserName, address, email, name, phone, website } = req.body;
        let imageUrl = '';
        console.log( "fileinbe", req.file );

        if ( req.file ) {
            imageUrl = await uploadToS3( req.file );
        }

        // Check if email already exists
        const existingCompany = await Company.findOne( { email } );
        if ( existingCompany ) {
            if ( req.file ) {
                await s3.deleteObject( {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: req.file.key
                } ).promise();
            }
            return res.status( 409 ).json( { message: "Email already registered." } );
        }

        const existingCompanyUserName = await Company.findOne( { CompanyUserName } );
        if ( existingCompanyUserName ) {
            if ( req.file ) {
                await s3.deleteObject( {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: req.file.key
                } ).promise();
            }
            return res.status( 409 ).json( { message: "Company Unique Name already registered." } );
        }

        const newCompany = new Company( {
            CompanyUserName,
            address,
            email,
            name,
            phone,
            website,
            image: imageUrl
        } );

        await newCompany.save();
        res.status( 201 ).json( newCompany );
    } catch ( error ) {
        if ( req.file ) {
            await s3.deleteObject( {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: req.file.key
            } ).promise();
        }
        res.status( 500 ).json( { message: error.message } );
    }
};

const updateCompany = async ( req, res ) => {
    try {
        const { id } = req.params;
        const { CompanyUserName, address, email, name, phone, website } = req.body;

        // Get the current company to check for existing image
        const currentCompany = await Company.findById( id );
        if ( !currentCompany ) {
            return res.status( 404 ).json( { message: "Company not found." } );
        }

        // Check if email is being changed and if new email already exists
        if ( email && email !== currentCompany.email ) {
            const existingCompany = await Company.findOne( { email } );
            if ( existingCompany ) {
                // If we uploaded a file but validation failed, delete it from S3
                if ( req.file ) {
                    await s3.deleteObject( {
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: req.file.key
                    } ).promise();
                }
                return res.status( 409 ).json( { message: "Email already registered." } );
            }
        }

        // Check if CompanyUserName is being changed and if new username already exists
        if ( CompanyUserName && CompanyUserName !== currentCompany.CompanyUserName ) {
            const existingCompanyUserName = await Company.findOne( { CompanyUserName } );
            if ( existingCompanyUserName ) {
                // If we uploaded a file but validation failed, delete it from S3
                if ( req.file ) {
                    await s3.deleteObject( {
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: req.file.key
                    } ).promise();
                }
                return res.status( 409 ).json( { message: "Company Unique Name already registered." } );
            }
        }

        let updateData = {
            CompanyUserName,
            address,
            email,
            name,
            phone,
            website
        };

        // Handle image upload
        if ( req.file ) {
            // Upload new image
            const imageUrl = await uploadToS3( req.file );
            updateData.image = imageUrl;

            // Delete the old image from S3 if it exists
            if ( currentCompany.image ) {
                try {
                    // Extract the key from the full S3 URL
                    const urlParts = currentCompany.image.split( '/' );
                    const oldImageKey = urlParts.slice( -2 ).join( '/' ); // Get 'companies/filename'

                    await s3.deleteObject( {
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: oldImageKey
                    } ).promise();
                } catch ( deleteError ) {
                    console.log( 'Error deleting old image:', deleteError.message );
                    // Continue with update even if old image deletion fails
                }
            }
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status( 200 ).json( {
            message: "Company updated successfully.",
            company: updatedCompany
        } );
    } catch ( error ) {
        // If we uploaded a file but an error occurred, delete it from S3
        if ( req.file ) {
            try {
                await s3.deleteObject( {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: req.file.key
                } ).promise();
            } catch ( deleteError ) {
                console.log( 'Error deleting uploaded file after error:', deleteError.message );
            }
        }
        res.status( 500 ).json( { message: error.message } );
    }
};

const deleteCompany = async ( req, res ) => {
    try {
        const { id } = req.params;

        const company = await Company.findById( id );
        if ( !company ) {
            return res.status( 404 ).json( { message: "Company not found." } );
        }

        // Delete the image from S3 if it exists
        if ( company.image ) {
            try {
                // Extract the key from the full S3 URL
                const urlParts = company.image.split( '/' );
                const imageKey = urlParts.slice( -2 ).join( '/' ); // Get 'companies/filename'

                await s3.deleteObject( {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: imageKey
                } ).promise();
            } catch ( deleteError ) {
                console.log( 'Error deleting image:', deleteError.message );
                // Continue with company deletion even if image deletion fails
            }
        }

        await Company.findByIdAndDelete( id );
        res.status( 200 ).json( { message: "Company deleted successfully." } );
    } catch ( error ) {
        res.status( 500 ).json( { message: error.message } );
    }
};

export { addCompany, updateCompany, deleteCompany, upload };