import User from '../../models/User.js';
import supabase, { fromDB } from '../../config/supabaseClient.js';

const updateUserByCandidate = async (req, res) => {
  try {
    const { jobID, candidateID, status } = req.body;

    console.log("Update user by candidate");
    console.log(req.body);

    // Fetch the user first to get existing applications array
    const user = await User.findById(candidateID);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const apps = Array.isArray(user.applications) ? user.applications : [];
    apps.push({ jobID, candidateID, status });

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ applications: apps })
      .eq('id', candidateID)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(fromDB(updatedUser));
  } catch (error) {
    console.error("Failed to update user by candidate:", error);
    res.status(500).json({ error: 'Failed to update user by candidate' });
  }
}

export { updateUserByCandidate };