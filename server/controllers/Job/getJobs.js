import Job from '../../models/Job.js';
import JobStatus from '../../models/JobStatus.js';
import supabase from '../../config/supabaseClient.js';

const getJobs = async (req, res) => {
  try {
    let { page = 1, limit = 12, search, title, locationType, type, scheduleType, hireType, city, status } = req.query;
    let company_id = req.headers['company_id']?.trim();

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = Math.max(parseInt(limit, 10) || 12, 1);

    // Build Supabase query (selecting only jobs columns to avoid relationship cache errors)
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .order('"createdAt"', { ascending: false })
      .range((pageNumber - 1) * limitNumber, pageNumber * limitNumber - 1);

    if (company_id) query = query.eq('company_id', company_id);
    if (locationType) query = query.ilike('"locationType"', `%${locationType}%`);
    if (city) query = query.ilike('city', `%${city}%`);
    if (type) query = query.ilike('type', `%${type}%`);
    if (scheduleType) query = query.ilike('"scheduleType"', `%${scheduleType}%`);
    if (hireType) query = query.ilike('"hireType"', `%${hireType}%`);
    if (search?.trim()) query = query.ilike('title', `%${search.trim()}%`);
    if (title) query = query.ilike('title', `%${title}%`);

    // Status filter: look up status ID from job_statuses table
    if (status) {
      const statusNames = status.split(',').map(s => s.trim());
      const { data: jobStatuses } = await supabase
        .from('job_statuses')
        .select('id, "jobStatus"')
        .eq('company_id', company_id)
        .in('"jobStatus"', statusNames);

      if (jobStatuses && jobStatuses.length > 0) {
        const statusIds = jobStatuses.map(js => js.id);
        query = query.in('status', statusIds);
      } else {
        return res.status(200).json({ jobs: [], totalCount: 0, currentPage: pageNumber, totalPages: 0 });
      }
    }

    const { data: jobs, count: totalCount, error } = await query;
    if (error) throw error;

    // Fetch company details manually via JS-side join
    const companyUsernames = [...new Set((jobs || []).map(j => j.company_id).filter(Boolean))];
    let companyMap = {};
    if (companyUsernames.length > 0) {
      const uuids = companyUsernames.filter(id => id.length === 36);
      const usernames = companyUsernames.filter(id => id.length !== 36);

      let conditions = [];
      if (uuids.length > 0) conditions.push(`id.in.(${uuids.map(id => `"${id}"`).join(',')})`);
      if (usernames.length > 0) conditions.push(`"CompanyUserName".in.(${usernames.map(name => `"${name}"`).join(',')})`);

      if (conditions.length > 0) {
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name, image, "CompanyUserName"')
          .or(conditions.join(','));
        
        (companies || []).forEach(c => {
          companyMap[c.id] = c;
          companyMap[c.CompanyUserName] = c;
        });
      }
    }

    // Add _id alias and attach joined company
    const formattedJobs = (jobs || []).map(j => ({
      ...j,
      _id: j.id,
      company: companyMap[j.company_id] || null
    }));

    res.status(200).json({
      jobs: formattedJobs,
      totalCount: totalCount || 0,
      currentPage: pageNumber,
      totalPages: Math.ceil((totalCount || 0) / limitNumber),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getJobs };
