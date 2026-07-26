import Application from '../../models/Application.js';
import InterviewSchedule from '../../models/Applicationlist.js';
import supabase from '../../config/supabaseClient.js';

const getCandidateAppDetail = async (req, res) => {
  try {
    const { candidateId, jobId } = req.params;
    let { page = 1, limit = 10, search = '' } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    let query = supabase
      .from('applications')
      .select('*', { count: 'exact' })
      .eq('"candidateID"', candidateId)
      .eq('"jobID"', jobId);

    if (search) {
      query = query.ilike('status', `%${search}%`);
    }

    const { data: rawApps, count: total, error } = await query
      .order('"createdAt"', { ascending: false })
      .limit(1);

    if (error) throw error;

    const application = rawApps && rawApps.length > 0 ? { ...rawApps[0], _id: rawApps[0].id } : null;

    if (application) {
      // Populate candidate details (users table) and job details (jobs table)
      const [candRes, jobRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', application.candidateID).maybeSingle(),
        supabase.from('jobs').select('*').eq('id', application.jobID).maybeSingle()
      ]);

      application.candidateID = candRes.data ? { ...candRes.data, _id: candRes.data.id } : application.candidateID;
      application.jobID = jobRes.data ? { ...jobRes.data, _id: jobRes.data.id } : application.jobID;

      // Get latest interview
      const { data: latestInterview } = await supabase
        .from('interview_schedules')
        .select('*')
        .eq('"applicationID"', application.id)
        .order('"createdAt"', { ascending: false })
        .limit(1)
        .maybeSingle();

      application.interview = latestInterview ? { ...latestInterview, _id: latestInterview.id } : null;
    }

    return res.status(200).json({
      applications: application,
      currentPage: page,
      totalPages: Math.ceil((total || 0) / limit),
      totalApplications: total || 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export { getCandidateAppDetail };
