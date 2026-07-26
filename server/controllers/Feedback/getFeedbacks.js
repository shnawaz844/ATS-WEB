import supabase from '../../config/supabaseClient.js';

export const getFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const ratingFilter = req.query.rating;

    let query = supabase.from('feedbacks').select('*', { count: 'exact' })
      .order('"createdAt"', { ascending: false })
      .range(skip, skip + limit - 1);

    if (ratingFilter && ratingFilter !== 'all') {
      if (ratingFilter === '0') {
        query = query.is('"starRating"', null);
      } else {
        query = query.gte('"starRating"', parseInt(ratingFilter));
      }
    }

    const { data: rawFeedbacks, count: total, error } = await query;
    if (error) throw error;

    // Enrich with application, job, candidate details
    const appIds = [...new Set((rawFeedbacks || []).map(f => f.applicationID).filter(Boolean))];
    let appMap = {}, jobMap = {}, candidateMap = {};

    if (appIds.length > 0) {
      const { data: apps } = await supabase.from('applications').select('id, "jobID", "candidateID", resume').in('id', appIds);
      (apps || []).forEach(a => { appMap[a.id] = a; });

      const jobIds = [...new Set((apps || []).map(a => a.jobID).filter(Boolean))];
      const candIds = [...new Set((apps || []).map(a => a.candidateID).filter(Boolean))];

      const [jobsRes, candsRes] = await Promise.all([
        jobIds.length > 0 ? supabase.from('jobs').select('id, title').in('id', jobIds) : { data: [] },
        candIds.length > 0 ? supabase.from('users').select('id, "userName"').in('id', candIds) : { data: [] },
      ]);

      (jobsRes.data || []).forEach(j => { jobMap[j.id] = { ...j, _id: j.id }; });
      (candsRes.data || []).forEach(c => { candidateMap[c.id] = { ...c, _id: c.id }; });
    }

    const feedbacks = (rawFeedbacks || []).map(f => {
      const app = appMap[f.applicationID];
      return {
        ...f,
        _id: f.id,
        applicationID: app ? {
          ...app, _id: app.id,
          jobID: jobMap[app.jobID] || app.jobID,
          candidateID: candidateMap[app.candidateID] || app.candidateID,
        } : f.applicationID,
      };
    });

    res.status(200).json({
      total: total || 0, page, limit, feedbacks, hasMore: page * limit < (total || 0),
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
