// controllers/Company/getCompanys.js

import Company from '../../models/company.js';

const getCompanies = async (req, res) => {
  try {
    // Default values for page & limit
    let { page = 1, limit = 10, search = '' } = req.query;

    // Convert page & limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // Build a query for searching CompanyName or email
    const query = {
      $or: [
        { CompanyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    };

    // Count total documents that match the query
    const totalCount = await Company.countDocuments(query);

    // Find Companys with pagination and search
    const Companies = await Company.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    // Send back Companys array and totalCount
    res.status(200).json({ 
      Companies,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get Companys' });
  }
};

export { getCompanies };
