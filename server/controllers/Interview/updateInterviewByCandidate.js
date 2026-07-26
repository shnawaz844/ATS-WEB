import Interview from '../../models/Interview.js';
import supabase, { fromDB } from '../../config/supabaseClient.js';

const updateInterviewByCandidate = async (req, res) => {
  try {
    const { interviewId, candidateID, status } = req.body;

    console.log("Update Interview by candidate");
    console.log(req.body);

    const interview = await Interview.findById(candidateID);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const apps = Array.isArray(interview.applications) ? interview.applications : [];
    apps.push({ interviewId, candidateID, status });

    const { data: updated, error } = await supabase
      .from('interviews')
      .update({ applications: apps })
      .eq('id', candidateID)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(fromDB(updated));
  } catch (error) {
    console.error("Failed to update interview by candidate:", error);
    res.status(500).json({ error: 'Failed to update interview by candidate' });
  }
}

export { updateInterviewByCandidate };