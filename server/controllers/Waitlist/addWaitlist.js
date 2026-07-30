import Waitlist from '../../models/Waitlist.js';
import { uploadToS3 } from "../../middleware/upload.js";

const addWaitlist = async (req, res) => {
  try {
    const waitlistData = req.body;
    let resumeUrl = waitlistData.resumeUrl || "";

    if (req.file) {
      try {
        const uploadResult = await uploadToS3(req.file);
        resumeUrl = uploadResult.fileUrl;
      } catch (e) {
        console.warn("⚠️ Waitlist resume upload failed:", e.message);
      }
    }
    
    waitlistData.resumeUrl = resumeUrl;

    const newWaitlist = await Waitlist.create(waitlistData);
    res.status(201).json({ message: 'Added to waitlist successfully', data: newWaitlist });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export { addWaitlist };
