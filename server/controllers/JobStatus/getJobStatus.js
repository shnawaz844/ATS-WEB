import JobStatus from "../../models/JobStatus.js";

const getJobStatus = async (req, res) => {
  try {
    const jobStatusId = req.params.id;
    const jobStatus = await JobStatus.findById(jobStatusId);
    if (!jobStatus) {
      return res.status(404).json({ message: "Job status not found" });
    }
    res.status(200).json(jobStatus);
  } catch (error) {
    res.status(500).json({ message: "Failed to get application" });
  }
};

export { getJobStatus };
