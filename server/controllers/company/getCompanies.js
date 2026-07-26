import supabase, { fromDB, fromDBArray } from '../../config/supabaseClient.js';

const getCompanies = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .order('"createdAt"', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`"CompanyUserName".ilike.%${search}%,email.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: companies, count: totalCount, error } = await query;
    if (error) throw error;

    res.status(200).json({
      Companies: fromDBArray(companies),
      totalCount: totalCount || 0,
      currentPage: page,
      totalPages: Math.ceil((totalCount || 0) / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get companies' });
  }
};

export { getCompanies };
