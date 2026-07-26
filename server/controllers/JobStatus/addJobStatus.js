import JobStatus from "../../models/JobStatus.js";

const addJobStatus = async (req, res) => {
  try {
    const { jobStep, jobStatus, company_id } = req.body;

    const existingJobStatus = await JobStatus.findOne({ jobStep, company_id });
    if (existingJobStatus) {
      return res.status(409).json({ message: "Job status already registered." });
    }

    const newJobStatus = await JobStatus.create({
      jobStep,
      jobStatus,
      company_id,
    });

    res.status(201).json(newJobStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addJobStatus };