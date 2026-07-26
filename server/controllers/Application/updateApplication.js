import Application from "../../models/Application.js";
import upload, { uploadToS3 } from "../../middleware/upload.js";

const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Application ID is required." });
    }

    const updateFields = { ...req.body };

    if (req.file) {
      console.log("Received new file:", req.file.originalname);
      const uploadResult = await uploadToS3(req.file);
      updateFields.resume = uploadResult.fileUrl;
    }
    
    // Clean fields that shouldn't be directly updated or are mongo-specific
    delete updateFields._id;
    delete updateFields.id;

    console.log("updated", updateFields);

    const updatedApplication = await Application.findByIdAndUpdate(id, updateFields);

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.status(200).json({ message: "Application updated successfully!", application: updatedApplication });
  } catch (error) {
    console.error("Error in updateApplication:", error);
    res.status(500).json({ message: error.message });
  }
};

export { upload, updateApplication };