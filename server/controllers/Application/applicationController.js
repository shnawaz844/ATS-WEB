import Application from '../../models/Application.js';
import InterviewSchedule from '../../models/Applicationlist.js';
import supabase from '../../config/supabaseClient.js';

const getCandidateApplications = async (req, res) => {
  try {
    const { candidateId } = req.params;
    let { page = 1, limit = 9, search = '' } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const skip = (page - 1) * limit;

    // Fetch applications for this candidate
    let query = supabase
      .from('applications')
      .select('*', { count: 'exact' })
      .eq('"candidateID"', candidateId)
      .order('"createdAt"', { ascending: false });

    // Since 'status' was search filtered in MongoDB, let's add it if search is provided
    if (search) {
      query = query.ilike('status', `%${search}%`);
    }

    const { data: rawApps, count: total, error: appError } = await query.range(skip, skip + limit - 1);
    if (appError) throw appError;

    const applications = rawApps || [];

    if (applications.length === 0) {
      return res.status(200).json({
        applications: [],
        currentPage: page,
        totalPages: 0,
        totalApplications: 0
      });
    }

    // Populate candidate details (users table) and job details (jobs table)
    const jobIds = [...new Set(applications.map(app => app.jobID).filter(Boolean))];
    const candidateIds = [...new Set(applications.map(app => app.candidateID).filter(Boolean))];

    const [jobsRes, candidatesRes] = await Promise.all([
      jobIds.length > 0 ? supabase.from('jobs').select('*').in('id', jobIds) : { data: [] },
      candidateIds.length > 0 ? supabase.from('users').select('*').in('id', candidateIds) : { data: [] }
    ]);

    const jobMap = {};
    (jobsRes.data || []).forEach(j => { jobMap[j.id] = { ...j, _id: j.id }; });

    const candidateMap = {};
    (candidatesRes.data || []).forEach(c => { candidateMap[c.id] = { ...c, _id: c.id }; });

    // Fetch interview schedules
    const applicationIds = applications.map(app => app.id);
    const { data: rawInterviews } = await supabase
      .from('interview_schedules')
      .select('*')
      .in('"applicationID"', applicationIds)
      .order('"createdAt"', { ascending: false });

    const interviews = rawInterviews || [];

    const applicationsWithInterviews = applications.map(app => {
      const latestInterview = interviews.find(i => i.applicationID === app.id);
      return {
        ...app,
        _id: app.id,
        candidateID: candidateMap[app.candidateID] || app.candidateID,
        jobID: jobMap[app.jobID] || app.jobID,
        interview: latestInterview ? { ...latestInterview, _id: latestInterview.id } : null
      };
    });

    return res.status(200).json({
      applications: applicationsWithInterviews,
      currentPage: page,
      totalPages: Math.ceil((total || 0) / limit),
      totalApplications: total || 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export { getCandidateApplications };
