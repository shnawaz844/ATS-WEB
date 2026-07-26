import Application from '../../models/Application.js';
import InterviewSchedule from '../../models/Applicationlist.js';
import supabase, { fromDB } from '../../config/supabaseClient.js';

const getApplication = async (req, res) => {
  try {
    const applicationID = req.params.id;
    const application = await Application.findById(applicationID);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { data: latestInterview } = await supabase
      .from('interview_schedules')
      .select('*')
      .eq('"applicationID"', applicationID)
      .order('"createdAt"', { ascending: false })
      .limit(1)
      .maybeSingle();

    const applicationWithInterview = {
      ...application,
      interview: latestInterview ? fromDB(latestInterview) : null
    };

    res.status(200).json(applicationWithInterview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getApplication };