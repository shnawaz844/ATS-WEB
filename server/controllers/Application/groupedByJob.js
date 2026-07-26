import Application from '../../models/Application.js';
import Job from '../../models/Job.js';
import Company from '../../models/company.js';
import supabase from '../../config/supabaseClient.js';

const getAllApplicationsGroupedByJob = async (req, res) => {
  try {
    let { page = 1, limit = 10, title, city, locationType, type, scheduleType, hireType } = req.query;
    let { company_id } = req.headers;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 6;

    // Step 1: Build job query
    let jobQuery = supabase.from('jobs').select('*').order('"createdAt"', { ascending: false });
    if (company_id) jobQuery = jobQuery.eq('company_id', company_id);
    if (title) jobQuery = jobQuery.ilike('title', `%${title}%`);
    if (city) jobQuery = jobQuery.ilike('city', `%${city}%`);
    if (locationType) jobQuery = jobQuery.ilike('"locationType"', `%${locationType}%`);
    if (type) jobQuery = jobQuery.ilike('type', `%${type}%`);
    if (scheduleType) jobQuery = jobQuery.ilike('"scheduleType"', `%${scheduleType}%`);
    if (hireType) jobQuery = jobQuery.ilike('"hireType"', `%${hireType}%`);

    const { data: filteredJobs, error: jobError } = await jobQuery;
    if (jobError) throw jobError;

    if (!filteredJobs || filteredJobs.length === 0) {
      return res.status(200).json({ totalJobs: 0, totalPages: 0, currentPage: pageNumber, data: [] });
    }

    const jobIds = filteredJobs.map(job => job.id);

    // Step 2: Get applications for these jobs
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('"jobID"')
      .in('"jobID"', jobIds);
    if (appError) throw appError;

    if (!applications || applications.length === 0) {
      return res.status(200).json({ totalJobs: 0, totalPages: 0, currentPage: pageNumber, data: [] });
    }

    // Step 3: Count applications per job
    const jobApplicationCounts = {};
    applications.forEach(app => {
      const jid = app.jobID;
      jobApplicationCounts[jid] = (jobApplicationCounts[jid] || 0) + 1;
    });

    // Step 4: Build result
    const resultData = [];
    for (const job of filteredJobs) {
      if (jobApplicationCounts[job.id]) {
        let location = '';
        if (job.locationType === 'Remote') {
          location = job.country || 'Remote';
        } else {
          const parts = [];
          if (job.city) parts.push(job.city);
          if (job.state) parts.push(job.state);
          location = parts.length > 0 ? parts.join(', ') : (job.country || 'N/A');
        }
        resultData.push({
          jobID: job.id,
          _id: job.id,
          title: job.title,
          city: location,
          locationType: job.locationType,
          type: job.type,
          scheduleType: job.scheduleType,
          hireType: job.hireType,
          compensation: job.compensation,
          applicationCount: jobApplicationCounts[job.id],
        });
      }
    }

    resultData.sort((a, b) => b.applicationCount - a.applicationCount);

    const totalJobs = resultData.length;
    const totalPages = Math.ceil(totalJobs / limitNumber);
    const validPage = Math.min(Math.max(1, pageNumber), Math.max(1, totalPages));
    const start = (validPage - 1) * limitNumber;
    const paginatedData = resultData.slice(start, start + limitNumber);

    return res.status(200).json({ totalJobs, totalPages, currentPage: validPage, data: paginatedData });
  } catch (error) {
    console.error('Error in getAllApplicationsGroupedByJob:', error);
    return res.status(500).json({ message: error.message });
  }
};

export { getAllApplicationsGroupedByJob };