import ApplicationStatus from "../../models/ApplicationStatus.js";
import supabase, { fromDB } from "../../config/supabaseClient.js";

const updateApplicationStatusCandidate = async (req, res) => {
  try {
    const { jobID, candidateID, status } = req.body;

    console.log("Update application type by candidate");
    console.log(req.body);

    const doc = await ApplicationStatus.findById(candidateID);
    if (!doc) {
      return res.status(404).json({ error: "Application status not found" });
    }

    const apps = Array.isArray(doc.applications) ? doc.applications : [];
    apps.push({ jobID, candidateID, status });

    const { data: updated, error } = await supabase
      .from('application_statuses')
      .update({ applications: apps })
      .eq('id', candidateID)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(fromDB(updated));
  } catch (error) {
    console.error("Failed to update application status by candidate:", error);
    res.status(500).json({ error: "Failed to update application status by candidate" });
  }
};

export { updateApplicationStatusCandidate };
