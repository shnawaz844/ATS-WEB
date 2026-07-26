import supabase from '../../config/supabaseClient.js';

export const getDashboardStats = async (req, res) => {
  try {
    const hiringManagerId = req.user._id;
    const companyId = req.headers['company_id'];

    if (!companyId) return res.status(400).json({ message: 'company_id is required' });

    // 1. Get jobs for this hiring manager
    const { data: jobs, error: jobError } = await supabase.from('jobs').select('*')
      .eq('"hiringManagerId"', hiringManagerId).eq('company_id', companyId);
    if (jobError) throw jobError;

    const jobIds = (jobs || []).map(j => j.id);

    // 2. Get applications for these jobs
    let applications = [];
    if (jobIds.length > 0) {
      const { data: apps } = await supabase.from('applications').select('*')
        .eq('company_id', companyId).in('"jobID"', jobIds).order('"createdAt"', { ascending: false });
      applications = apps || [];
    }

    // 3. Get candidate names
    const candidateIds = [...new Set(applications.map(app => app.candidateID).filter(Boolean))];
    let candidateMap = {};
    if (candidateIds.length > 0) {
      const { data: candidates } = await supabase.from('users').select('id, "userName"').in('id', candidateIds);
      (candidates || []).forEach(u => { candidateMap[u.id] = u.userName; });
    }

    // 4. Get application statuses
    const { data: statusDocs } = await supabase.from('application_statuses').select('id, "applicationStatus"').eq('company_id', companyId);
    const statusMap = {};
    (statusDocs || []).forEach(s => { statusMap[s.id] = s.applicationStatus; });

    const jobMap = {};
    (jobs || []).forEach(j => { jobMap[j.id] = j; });

    let activeCount = 0, offeredCount = 0, totalExperience = 0, expCount = 0;

    const processedApps = applications.map(app => {
      const statusName = statusMap[app.applicationStatusId] || 'Unknown';
      const job = jobMap[app.jobID];
      const expMatch = (app.experience || '0').match(/(\d+)/);
      const expValue = expMatch ? parseInt(expMatch[0]) : 0;
      if (expValue > 0) { totalExperience += expValue; expCount++; }
      if (statusName === 'Offered') offeredCount++;
      if (['Interview', 'Screening', 'Shortlisted'].includes(statusName)) activeCount++;
      return {
        id: app.id, _id: app.id,
        jobTitle: job ? job.title : 'Unknown Job',
        jobField: job ? job.title : 'Unknown',
        applicantName: candidateMap[app.candidateID] || app.contactInfo || 'Unknown Candidate',
        email: app.emailInfo, status: statusName,
        experience: app.experience, appliedDate: app.createdAt, stage: statusName,
      };
    });

    const totalApplications = applications.length;
    const avgExperience = totalApplications > 0 && expCount > 0 ? (totalExperience / expCount).toFixed(1) : 0;
    const offerRate = totalApplications > 0 ? ((offeredCount / totalApplications) * 100).toFixed(1) : 0;

    const recentApplications = processedApps.slice(0, 5);
    const statusCounts = {};
    processedApps.forEach(app => { statusCounts[app.status] = (statusCounts[app.status] || 0) + 1; });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyApplications = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      monthlyApplications[months[d.getMonth()]] = 0;
    }
    processedApps.forEach(app => {
      const month = months[new Date(app.appliedDate).getMonth()];
      if (monthlyApplications.hasOwnProperty(month)) monthlyApplications[month]++;
    });
    const monthlyData = Object.entries(monthlyApplications).map(([month, count]) => ({ month, count }));

    res.status(200).json({
      stats: [
        { title: 'Total Applications', value: totalApplications, change: '+0%', trend: 'up' },
        { title: 'Active Applications', value: activeCount, change: '+0%', trend: 'up' },
        { title: 'Offer Rate', value: `${offerRate}%`, change: '+0%', trend: 'up' },
        { title: 'Avg. Experience', value: `${avgExperience} years`, change: '+0%', trend: 'up' },
      ],
      recentApplications, statusCounts, monthlyApplications: monthlyData,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
