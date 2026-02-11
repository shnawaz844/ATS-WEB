import Interview from '../../models/Interview.js';
import Company from '../../models/company.js';

const getInterviews = async (req, res) => {
  try {
    // Default values for page & limit
    let { page = 1, limit = 10, search = '' } = req.query;
    const { company_id } = req.headers;

    // Convert page & limit to numbers (ensure valid numbers)
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // Build a query for searching roundName or roundNumber only if search is provided
    const query = {};

    if (company_id) {
      query.company_id = company_id;

      const company = await Company.findById(company_id);
      if (company && company.onlyAiFeaturesEnabled) {
        query.roundName = { $regex: 'AI', $options: 'i' };
      }
    }

    if (search) {
      query.$or = [
        { roundName: { $regex: search, $options: 'i' } },
        { roundNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // console.log( 'Query:', query );  // Debugging query structure

    // Count total documents that match the query
    const totalCount = await Interview.countDocuments(query);

    // Find interviews with pagination and search
    const interviews = await Interview.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Send back interviews array and totalCount
    res.status(200).json({
      interviews,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error(error);  // Log error for debugging
    res.status(500).json({ message: 'Failed to get interviews' });
  }
};

export { getInterviews };
