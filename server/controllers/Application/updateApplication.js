import Application from "../../models/Application.js";
import upload, { uploadToS3 } from "../../middleware/upload.js";

const updateApplication = async (req, res) => {
    try {
        // Get the application id from the URL parameters.
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Application ID is required." });
        }

        // Prepare an object with fields to update.
        // This allows you to update one or more fields, including applicationStatus.
        const updateFields = { ...req.body };

        // If a new resume file is provided, handle the upload.
        if (req.file) {
            console.log("Received new file:", req.file.originalname);
            const uploadResult = await uploadToS3(req.file);
            updateFields.resume = uploadResult.fileUrl;
        }
        console.log("updated", updateFields);

        // Find the application by id and update it.
        // The { new: true } option returns the updated document.
        const updatedApplication = await Application.findByIdAndUpdate(id, updateFields, { new: true });

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