import Application from "../../models/Application.js";
import upload, { uploadToS3 } from "../../middleware/upload.js";
import Job from "../../models/Job.js";

const addApplication = async (req, res) => {
  console.log("testconsole")
  const { jobID, candidateID, applicationStatusId, contactInfo, emailInfo, experience, questions, answers, company_id, jobStatusId } = req.body;
  try {
    if ( !jobID || !candidateID || !applicationStatusId || !contactInfo || !emailInfo || !experience || !company_id || !jobStatusId ) {
      return res.status(400).json({ message: "All required fields must be provided.console" });
    }

    // Check if resume file exists
    let resumeUrl = null;
    console.log("dtat11111")
    if (req.file) {
      resumeUrl = await uploadToS3(req.file);
    } else {
      return res.status(400).json({ message: "Resume file is required." });
    }

    // Create a new application entry
    const newApplication = new Application({
      jobID,
      candidateID,
      applicationStatusId,
      jobStatusId,
      resume: resumeUrl, // Store S3 file URL
      contactInfo,
      emailInfo,
      experience,
      questions: questions || [],
      answers: answers || [],
      company_id,
    });
console.log("first")
    await newApplication.save();
console.log("second")

    // ✅ Update job status to 'Filled' only if it's the first application
    const existingApplications = await Application.find( { jobID } );
    if ( existingApplications.length === 1 ) {  // Just saved one application above
      await Job.findByIdAndUpdate( jobID, { status: jobStatusId } );
    }

    res.status(201).json({ message: "Application submitted successfully!", application: newApplication });
  } catch (error) {
    console.error("Error in addApplication:", error);
    res.status(500).json({ message: error.message });
  }
};

// Exporting multer middleware & controller
export { upload, addApplication };
