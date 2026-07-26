import JobStatus from "../../models/JobStatus.js";

const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobStep, jobStatus, company_id } = req.body;

    const jobType = await JobStatus.findById(id);
    if (!jobType) {
      return res.status(404).json({
        success: false,
        message: "Job status not found",
      });
    }

    const updated = await JobStatus.findByIdAndUpdate(id, {
      jobStep,
      jobStatus,
      company_id
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { updateJobStatus };
