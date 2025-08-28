import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";

dotenv.config();

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer Middleware to Handle File Uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory before uploading to S3
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    console.log("File filter called for file:", file);
    // Accept only image and PDF files
    if ( file.mimetype.startsWith( "image/" ) || file.mimetype === "application/pdf" || file.mimetype === "application/msword" || file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      cb(null, true);
    } else {
      cb(new Error("Only image and PDF files are allowed!"), false);
    }
  },
});

// Function to Upload File to S3
export const uploadToS3 = async (file) => {
  try {
    console.log("Uploading file to S3:", file.originalname);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype, // Ensure correct content type
    };

    const upload = new Upload({
      client: s3,
      params,
    });

    await upload.done();

    const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    console.log("File uploaded successfully:", fileUrl);

    return fileUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("File upload failed");
  }
};

export default upload;
