import Recruiter from '../../models/Recruiter.js';
import supabase, { fromDB } from '../../config/supabaseClient.js';

const getRecruiter = async (req, res) => {
  try {
    const recID = req.params.id;

    // Use recID to query, fallback to the hardcoded ID if recID is not provided
    const idToSearch = recID || "6673362cab92f179a717d0e3";
    
    // We try to retrieve by ID
    const { data: recruiter, error } = await supabase
      .from('recruiters')
      .select('*')
      .eq('id', idToSearch)
      .maybeSingle();

    if (error) throw error;

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.status(200).json(fromDB(recruiter));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getRecruiter };