import supabase from '../../config/supabaseClient.js';

export const getAdminPerformanceStats = async (req, res) => {
  try {
    const { company_id } = req.headers;
    if (!company_id) return res.status(400).json({ message: 'company_id is required' });

    const { data: users } = await supabase.from('users').select('id, "userName", role, email').eq('company_id', company_id);
    const hiringManagers = (users || []).filter(u => u.role === 'hiring_manager');
    const recruiters = (users || []).filter(u => u.role === 'recruiter_manager');
    const interviewers = (users || []).filter(u => u.role === 'interviewer');

    const { data: jobs } = await supabase.from('jobs').select('id, "hiringManagerId", "recruiterId", status, title').eq('company_id', company_id);
    const jobIds = (jobs || []).map(j => j.id);

    let applications = [];
    if (jobIds.length > 0) {
      const { data: apps } = await supabase.from('applications').select('"jobID"').eq('company_id', company_id).in('"jobID"', jobIds);
      applications = apps || [];
    }

    const appCounts = {};
    applications.forEach(app => { appCounts[app.jobID] = (appCounts[app.jobID] || 0) + 1; });

    const calculateEfficiency = (jobsCount, appsCount) => {
      if (jobsCount === 0 && appsCount === 0) return 2;
      return Math.min(10, Math.max(1, Math.round((jobsCount * 1.5) + (appsCount * 0.2) + 2)));
    };

    const hmPerformance = hiringManagers.map(hm => {
      const hmJobs = (jobs || []).filter(j => j.hiringManagerId === hm.id || j.hiringManagerId === hm.userName);
      const totalApps = hmJobs.reduce((acc, j) => acc + (appCounts[j.id] || 0), 0);
      return { id: hm.id, _id: hm.id, name: hm.userName, email: hm.email, jobsCount: hmJobs.length, applicationsCount: totalApps, efficiency: calculateEfficiency(hmJobs.length, totalApps) };
    });

    const recruiterPerformance = recruiters.map(r => {
      const rJobs = (jobs || []).filter(j => j.recruiterId === r.id || j.recruiterId === r.userName);
      const totalApps = rJobs.reduce((acc, j) => acc + (appCounts[j.id] || 0), 0);
      return { id: r.id, _id: r.id, name: r.userName, email: r.email, jobsCount: rJobs.length, applicationsCount: totalApps, efficiency: calculateEfficiency(rJobs.length, totalApps) };
    });

    let interviewCounts = {};
    if (interviewers.length > 0) {
      const { data: schedules } = await supabase.from('interview_schedules').select('"interviewerID"').eq('company_id', company_id);
      (schedules || []).forEach(s => {
        if (s.interviewerID) interviewCounts[s.interviewerID] = (interviewCounts[s.interviewerID] || 0) + 1;
      });
    }

    const interviewerPerformance = interviewers.map(i => {
      const iCount = interviewCounts[i.id] || 0;
      return { id: i.id, _id: i.id, name: i.userName, email: i.email, interviewsCount: iCount, efficiency: iCount === 0 ? 2 : Math.min(10, Math.round(3 + (iCount * 1.2))) };
    });

    res.status(200).json({ hiringManagers: hmPerformance, recruiters: recruiterPerformance, interviewers: interviewerPerformance });
  } catch (error) {
    console.error('Error fetching admin performance stats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
