import Job from '../../models/Job.js';
import supabase from '../../config/supabaseClient.js';

const getJobByTitleCode = async (req, res) => {
  try {
    const { titleCode } = req.params;
    const { company_id } = req.headers;

    const job = await Job.findOne({ titleCode, company_id });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Populate status (from job_statuses table)
    if (job.status) {
      const { data: statusData } = await supabase
        .from('job_statuses')
        .select('*')
        .eq('id', job.status)
        .maybeSingle();
      if (statusData) {
        job.status = { ...statusData, _id: statusData.id };
      }
    }

    // Populate recruiter (from users table)
    if (job.recruiterId) {
      const { data: recruiterData } = await supabase
        .from('users')
        .select('*')
        .eq('id', job.recruiterId)
        .maybeSingle();
      if (recruiterData) {
        job.recruiterId = { ...recruiterData, _id: recruiterData.id };
      }
    }

    // Populate hiring manager (from users table)
    if (job.hiringManagerId) {
      const { data: hmData } = await supabase
        .from('users')
        .select('*')
        .eq('id', job.hiringManagerId)
        .maybeSingle();
      if (hmData) {
        job.hiringManagerId = { ...hmData, _id: hmData.id };
      }
    }

    res.status(200).json({
      success: true,
      job: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export { getJobByTitleCode };