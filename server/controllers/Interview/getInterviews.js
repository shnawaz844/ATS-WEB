import supabase from '../../config/supabaseClient.js';

const getInterviews = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;
    const { company_id } = req.headers;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    let query = supabase.from('interviews').select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1);

    if (company_id) query = query.eq('company_id', company_id);
    if (search) {
      query = query.or(`"roundName".ilike.%${search}%,"roundNumber".ilike.%${search}%`);
    }

    // Check if company has onlyAiFeaturesEnabled
    if (company_id) {
      const { data: company } = await supabase.from('companies').select('"onlyAiFeaturesEnabled"').eq('id', company_id).maybeSingle();
      if (company?.onlyAiFeaturesEnabled) {
        query = query.ilike('"roundName"', '%AI%');
      }
    }

    const { data: interviews, count: totalCount, error } = await query;
    if (error) throw error;

    res.status(200).json({
      interviews: (interviews || []).map(i => ({ ...i, _id: i.id })),
      totalCount: totalCount || 0,
      currentPage: page,
      totalPages: Math.ceil((totalCount || 0) / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get interviews' });
  }
};

export { getInterviews };
