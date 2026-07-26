import supabase from '../../config/supabaseClient.js';

const getApplicationsByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    let { page = 1, limit = 10, search = '', month, year, status } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Base filter
    let appsQuery = supabase.from('applications').select('*').eq('"jobID"', jobId);

    // Month/year filter
    if (month && year) {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
      appsQuery = appsQuery.gte('"createdAt"', startDate).lte('"createdAt"', endDate);
    } else if (year) {
      const startDate = new Date(year, 0, 1).toISOString();
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999).toISOString();
      appsQuery = appsQuery.gte('"createdAt"', startDate).lte('"createdAt"', endDate);
    }

    const { data: allApplications, error: appError } = await appsQuery.order('"createdAt"', { ascending: false });
    if (appError) throw appError;

    let applications = allApplications || [];

    // Search by candidate name
    if (search) {
      const { data: matchingCandidates } = await supabase
        .from('users')
        .select('id')
        .ilike('"userName"', `%${search}%`);
      const candidateIds = (matchingCandidates || []).map(c => c.id);
      applications = applications.filter(app => candidateIds.includes(app.candidateID));
    }

    // Count per status BEFORE status filter
    const statusCounts = {};
    applications.forEach(app => {
      if (app.applicationStatusId) {
        statusCounts[app.applicationStatusId] = (statusCounts[app.applicationStatusId] || 0) + 1;
      }
    });

    // Apply status filter
    if (status) {
      applications = applications.filter(app => app.applicationStatusId === status);
    }

    const total = applications.length;
    const skip = (page - 1) * limit;
    const paginatedApps = applications.slice(skip, skip + limit);

    // Enrich with candidate and job details
    const candidateIds = [...new Set(paginatedApps.map(a => a.candidateID).filter(Boolean))];
    let candidateMap = {};
    if (candidateIds.length > 0) {
      const { data: candidates } = await supabase.from('users').select('*').in('id', candidateIds);
      (candidates || []).forEach(c => { candidateMap[c.id] = { ...c, _id: c.id }; });
    }

    // Fetch job details
    const { data: jobData } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle();

    const enriched = paginatedApps.map(app => ({
      ...app,
      _id: app.id,
      candidateID: candidateMap[app.candidateID] || app.candidateID,
      jobID: jobData ? { ...jobData, _id: jobData.id } : app.jobID,
    }));

    return res.status(200).json({
      applications: enriched,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalApplications: total,
      statusCounts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export { getApplicationsByJobId };