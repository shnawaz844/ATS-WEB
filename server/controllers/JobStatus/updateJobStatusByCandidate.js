import JobStatus from "../../models/JobStatus.js";
import supabase, { fromDB } from "../../config/supabaseClient.js";

const updateJobStatusByCandidate = async (req, res) => {
  try {
    const { jobID, candidateID, status } = req.body;

    console.log("Update job type by candidate");
    console.log(req.body);

    const doc = await JobStatus.findById(candidateID);
    if (!doc) {
      return res.status(404).json({ error: "Job status not found" });
    }

    const jobs = Array.isArray(doc.jobs) ? doc.jobs : [];
    jobs.push({ jobID, candidateID, status });

    const { data: updated, error } = await supabase
      .from('job_statuses')
      .update({ jobs })
      .eq('id', candidateID)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(fromDB(updated));
  } catch (error) {
    console.error("Failed to update job status by candidate:", error);
    res.status(500).json({ error: "Failed to update job status by candidate" });
  }
};

export { updateJobStatusByCandidate };
