import supabase from '../../config/supabaseClient.js';

const getUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', role } = req.query;
    const { company_id } = req.headers;
    page = parseInt(page);
    limit = parseInt(limit);

    let query = supabase.from('users').select('*', { count: 'exact' })
      .order('role', { ascending: true })
      .order('"createdAt"', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (company_id) query = query.eq('company_id', company_id);
    if (role) query = query.eq('role', role);
    if (search) {
      query = query.or(`"userName".ilike.%${search}%,email.ilike.%${search}%`);
    }

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
