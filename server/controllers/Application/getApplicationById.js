import Application from '../../models/Application.js';
import supabase from '../../config/supabaseClient.js';

const getApplicationById = async (req, res) => {
  try {
    const id = req.params.id; // hiring manager ID
    let { page = 1, limit = 20, search = '' } = req.query;
    let { company_id } = req.headers;

    page = parseInt(page);
    limit = parseInt(limit);

    // 1. Fetch all applications for this company
    let appsQuery = supabase.from('applications').select('*').eq('company_id', company_id);
    const { data: applications, error: appError } = await appsQuery;
    if (appError) throw appError;

    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this hiring manager', searchedId: id });
    }

    // 2. Fetch jobs belonging to this hiring manager
    const { data: jobs, error: jobError } = await supabase
      .from('jobs')
      .select('id, title, "hiringManagerId"')
      .eq('"hiringManagerId"', id)
      .eq('company_id', company_id);
    if (jobError) throw jobError;

    const jobIds = (jobs || []).map(j => j.id);
    const jobMap = {};
    (jobs || []).forEach(j => { jobMap[j.id] = j; });

    // 3. Filter applications by job IDs belonging to this hiring manager
    let filteredApps = applications.filter(app => jobIds.includes(app.jobID));

    // 4. Fetch candidate names
    const candidateIds = [...new Set(filteredApps.map(app => app.candidateID).filter(Boolean))];
    let candidateMap = {};
    if (candidateIds.length > 0) {
      const { data: candidates } = await supabase
        .from('users')
        .select('id, "userName"')
        .in('id', candidateIds);
      (candidates || []).forEach(c => { candidateMap[c.id] = c; });
    }

    // 5. Fetch application statuses
    const statusIds = [...new Set(filteredApps.map(app => app.applicationStatusId).filter(Boolean))];
    let statusMap = {};
    if (statusIds.length > 0) {
      const { data: statuses } = await supabase
        .from('application_statuses')
        .select('id, "applicationStatus"')
        .in('id', statusIds);
      (statuses || []).forEach(s => { statusMap[s.id] = s; });
    }

    // 6. Fetch interview schedules — exclude apps that already have interviews
    const appIds = filteredApps.map(app => app.id);
    let scheduledAppIds = new Set();
    if (appIds.length > 0) {
      const { data: schedules } = await supabase
        .from('interview_schedules')
        .select('"applicationID"')
        .in('"applicationID"', appIds);
      (schedules || []).forEach(s => scheduledAppIds.add(s.applicationID));
    }

    // 7. Filter out apps that already have interviews scheduled
    filteredApps = filteredApps.filter(app => !scheduledAppIds.has(app.id));

    // 8. Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApps = filteredApps.filter(app => {
        const jobTitle = (jobMap[app.jobID]?.title || '').toLowerCase();
        const candidateName = (candidateMap[app.candidateID]?.userName || '').toLowerCase();
        return jobTitle.includes(searchLower) || candidateName.includes(searchLower);
      });
    }

    // 9. Sort by createdAt desc, paginate
    filteredApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const totalCount = filteredApps.length;
    const paginated = filteredApps.slice((page - 1) * limit, page * limit);

    // 10. Enrich with details
    const enriched = paginated.map(app => ({
      ...app,
      _id: app.id,
      jobDetails: jobMap[app.jobID] || null,
      candidateDetails: { ...candidateMap[app.candidateID], company_id },
      statusDetails: statusMap[app.applicationStatusId] || null,
    }));

    if (enriched.length === 0) {
      return res.status(404).json({ message: 'No applications found for this hiring manager', searchedId: id });
    }

    res.status(200).json({
      applications: enriched,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error in getApplicationById:', error);
    res.status(500).json({ message: 'Server error', error: error.message, searchedId: req.params.id });
  }
};

export { getApplicationById };
