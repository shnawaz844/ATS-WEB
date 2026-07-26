import Application from '../../models/Application.js';
import Job from '../../models/Job.js';
import supabase from '../../config/supabaseClient.js';

const getApplications = async (req, res) => {
  try {
    let company_id = req.headers['company_id']?.trim();

    // Fetch applications filtered by company_id
    let appsQuery = supabase.from('applications').select('*').order('"createdAt"', { ascending: false });
    if (company_id) appsQuery = appsQuery.eq('company_id', company_id);
    const { data: applications, error: appError } = await appsQuery;
    if (appError) throw appError;

    if (!applications || applications.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch job titles for all job IDs
    const jobIds = [...new Set(applications.map(app => app.jobID).filter(Boolean))];
    const { data: jobs } = await supabase.from('jobs').select('id, "jobID", title').in('id', jobIds);

    const jobLookup = {};
    (jobs || []).forEach(job => {
      jobLookup[job.id] = job.title;
      if (job.jobID) jobLookup[job.jobID] = job.title;
    });

    const result = applications.map(app => ({
      ...app,
      _id: app.id,
      jobTitle: jobLookup[app.jobID] || 'Unknown Job',
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { getApplications };
