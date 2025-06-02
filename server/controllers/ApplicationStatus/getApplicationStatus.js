import ApplicationStatus from "../../models/ApplicationStatus.js";

const getApplicationStatus = async (req, res) => {
  try {
    const applicationStatusId = req.params.id;
    const applicationStatus = await ApplicationStatus.findById(applicationStatusId);
    res.status(200).json(applicationStatus);
  } catch (error) {
    res.status(500).json({ message: "Failed to get application" });
  }
};

export { getApplicationStatus };
