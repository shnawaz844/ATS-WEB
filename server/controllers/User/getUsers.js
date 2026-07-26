import supabase from '../../config/supabaseClient.js';

const getUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', role } = req.query;
    const company_id = req.headers['company_id'] || req.headers['Company_id'];
    page = parseInt(page);
    limit = parseInt(limit);

    let query = supabase.from('users').select('*', { count: 'exact' });

    if (company_id && company_id !== 'super') {
      query = query.eq('company_id', company_id);
    }
    if (role) {
      query = query.eq('role', role);
    }
    if (search) {
      query = query.or(`"userName".ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query
      .order('role', { ascending: true })
      .order('"createdAt"', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data: users, count: totalCount, error } = await query;
    if (error) throw error;

    res.status(200).json({
      users: (users || []).map(u => ({ ...u, _id: u.id })),
      totalCount: totalCount || 0,
      currentPage: page,
      totalPages: Math.ceil((totalCount || 0) / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users' });
  }
};

export { getUsers };
