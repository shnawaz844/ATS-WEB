import supabase from '../../config/supabaseClient.js';

export const getInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const candidateID = req.query.candidateID;
    const jobId = req.query.jobID;
    const interviewerID = req.query.interviewerID !== 'admin' ? decodeURIComponent(req.query.interviewerID || '') : '';
    const searchTerm = req.query.searchTerm || '';
    const filterStatus = req.query.filterStatus || '';
    const filterRound = req.query.filterRound || '';
    const { company_id } = req.headers;

    const skip = (page - 1) * limit;

    // Build base Supabase query
    let query = supabase.from('interview_schedules').select('*').order('"createdAt"', { ascending: false });
    if (company_id) query = query.eq('company_id', company_id);
    if (interviewerID) query = query.eq('"interviewerID"', interviewerID);
    if (filterStatus && filterStatus.trim() !== '' && filterStatus !== 'all') query = query.eq('status', filterStatus);
    if (filterRound && filterRound.trim() !== '' && filterRound !== 'all') query = query.eq('"roundID"', filterRound);

    const { data: rawSchedules, error } = await query;
    if (error) throw error;

    let schedules = rawSchedules || [];

    // Check if company has onlyAiFeaturesEnabled
    if (company_id) {
      const { data: company } = await supabase.from('companies').select('"onlyAiFeaturesEnabled"').eq('id', company_id).maybeSingle();
      if (company?.onlyAiFeaturesEnabled) {
        schedules = schedules.filter(s => s.interviewerType === 'AI');
      }
    }

    // Enrich with application, job, candidate, interviewer, round details
    const appIds = [...new Set(schedules.map(s => s.applicationID).filter(Boolean))];
    const interviewerIds = [...new Set(schedules.map(s => s.interviewerID).filter(Boolean))];
    const roundIds = [...new Set(schedules.map(s => s.roundID).filter(Boolean))];

    const [appsRes, interviewersRes, roundsRes] = await Promise.all([
      appIds.length > 0 ? supabase.from('applications').select('id, "jobID", "candidateID", resume').in('id', appIds) : { data: [] },
      interviewerIds.length > 0 ? supabase.from('users').select('id, "userName", email').in('id', interviewerIds) : { data: [] },
      roundIds.length > 0 ? supabase.from('interviews').select('id, "roundName"').in('id', roundIds) : { data: [] },
    ]);

    const appMap = {};
    (appsRes.data || []).forEach(a => { appMap[a.id] = a; });
    const interviewerMap = {};
    (interviewersRes.data || []).forEach(i => { interviewerMap[i.id] = { ...i, _id: i.id }; });
    const roundMap = {};
    (roundsRes.data || []).forEach(r => { roundMap[r.id] = { ...r, _id: r.id }; });

    // Fetch jobs and candidates
    const jobIds = [...new Set(Object.values(appMap).map(a => a.jobID).filter(Boolean))];
    const candIds = [...new Set(Object.values(appMap).map(a => a.candidateID).filter(Boolean))];

    const [jobsRes, candidatesRes] = await Promise.all([
      jobIds.length > 0 ? supabase.from('jobs').select('id, title').in('id', jobIds) : { data: [] },
      candIds.length > 0 ? supabase.from('users').select('id, "userName"').in('id', candIds) : { data: [] },
    ]);

    const jobMap = {};
    (jobsRes.data || []).forEach(j => { jobMap[j.id] = { ...j, _id: j.id }; });
    const candidateMap = {};
    (candidatesRes.data || []).forEach(c => { candidateMap[c.id] = { ...c, _id: c.id }; });

    // Enrich schedules
    let enriched = schedules.map(s => {
      const app = appMap[s.applicationID];
      const job = app ? jobMap[app.jobID] : null;
      const candidate = app ? candidateMap[app.candidateID] : null;
      return {
        ...s,
        _id: s.id,
        applicationID: app ? {
          ...app, _id: app.id,
          jobID: job || app.jobID,
          candidateID: candidate || app.candidateID,
        } : s.applicationID,
        interviewerID: interviewerMap[s.interviewerID] || s.interviewerID,
        roundID: roundMap[s.roundID] || s.roundID,
      };
    });

    // Post-population filters
    if (candidateID) {
      enriched = enriched.filter(s => s.applicationID?.candidateID?._id === candidateID || s.applicationID?.candidateID?.id === candidateID);
    }
    if (jobId) {
      enriched = enriched.filter(s => s.applicationID?.jobID?._id === jobId || s.applicationID?.jobID?.id === jobId);
    }
    if (searchTerm?.trim()) {
      const regex = new RegExp(searchTerm, 'i');
      enriched = enriched.filter(s => {
        const jobTitle = s.applicationID?.jobID?.title || '';
        const candidateName = s.applicationID?.candidateID?.userName || '';
        const interviewerName = s.interviewerID?.userName || '';
        return regex.test(jobTitle) || regex.test(candidateName) || regex.test(interviewerName);
      });
    }

    const totalInterviews = enriched.length;
    const interviews = enriched.slice(skip, skip + limit);

    res.status(200).json({
      totalPages: Math.ceil(totalInterviews / limit),
      currentPage: page,
      totalInterviews,
      interviews,
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default getInterviews;