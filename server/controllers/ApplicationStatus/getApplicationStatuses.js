import supabase from '../../config/supabaseClient.js';

const getApplicationStatuses = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;
    const { company_id } = req.headers;
    page = parseInt(page);
    limit = parseInt(limit);

    let query = supabase.from('application_statuses').select('*', { count: 'exact' })
      .order('"applicationStep"', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (company_id) query = query.eq('company_id', company_id);
    if (search) query = query.ilike('"applicationStatus"', `%${search}%`);

    const { data: applicationStatuses, count: totalCount, error } = await query;
    if (error) throw error;

    res.status(200).json({
      applicationStatuses: (applicationStatuses || []).map(s => ({ ...s, _id: s.id })),
      totalCount: totalCount || 0,
      currentPage: page,
      totalPages: Math.ceil((totalCount || 0) / limit),
    });
  } catch (error) {
    console.error('Error getting application Status:', error);
    res.status(500).json({ message: 'Failed to get application status' });
  }
};

export { getApplicationStatuses };