import Job from '../../models/Job.js';
import supabase, { fromDB } from '../../config/supabaseClient.js';

const updateJobByCandidate = async (req, res) => {
  try {
    const { jobID, candidateID, status } = req.body;

    console.log("Update job by candidate");
    console.log(req.body);

    const job = await Job.findById(jobID);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const applicants = Array.isArray(job.applicants) ? job.applicants : [];
    applicants.push({ applicant: candidateID, status });

    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update({ applicants })
      .eq('id', job.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(fromDB(updatedJob));
  } catch (error) {
    console.error("Failed to update job by candidate:", error);
    res.status(500).json({ error: 'Failed to update job by candidate' });
  }
}

export { updateJobByCandidate };