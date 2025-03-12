// controllers/User/getUsers.js

import User from '../../models/User.js';

const getUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', role } = req.query;
    const { company_id } = req.headers;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = {
      $or: [
        { userName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    };

    // If role is provided (e.g., role=admin for super users), add a filter.
    if (role) {
      query.role = role;
    }
    if(company_id){
      query.company_id = company_id
    }

    const totalCount = await User.countDocuments(query);
    const users = await User.find({ ...query })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      users,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users' });
  }
};

export { getUsers };
