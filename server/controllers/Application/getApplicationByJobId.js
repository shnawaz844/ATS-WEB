// controllers/applicationController.js

import Application from '../../models/Application.js';
import User from '../../models/User.js'; // Assuming your candidate model is User

/**
 * GET /api/applications/job/:jobId
 * Query Params: page (default: 1), limit (default: 10), search (optional)
 */
const getApplicationsByJobId = async (req, res) => {
  try {
    // Extract jobId from route params
    const { jobId } = req.params;

    // Extract query parameters, provide defaults
    let { page = 1, limit = 10, search = '', month, year, status } = req.query;

    // Convert page and limit to integers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Build the base filter object
    let filter = { jobID: jobId };

    // If search is provided, find candidate IDs that match the username search
    if (search) {
      // Find candidates whose username matches the search term
      const matchingCandidates = await User.find({
        userName: { $regex: search, $options: 'i' }
      }).select('_id');

      // Extract the IDs as strings for exact matching
      const candidateIds = matchingCandidates.map(candidate => candidate._id.toString());

      // Add candidateID filter to the main filter
      filter.candidateID = { $in: candidateIds };
    }

    // Month and year filter
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      filter.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      filter.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // NEW: Get counts for each applicationStatusId BEFORE adding status filter
    // We use aggregate to get counts for all statuses across all pages
    const statusCountsRaw = await Application.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: "$applicationStatusId",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {};
    statusCountsRaw.forEach(item => {
      // Ensure the key is a string representing the status ID
      if (item._id) {
        statusCounts[item._id.toString()] = item.count;
      }
    });

    // Add status filter if provided (after counts calculation)
    if (status) {
      filter.applicationStatusId = status;
    }

    // Get total count of matching documents for pagination
    const total = await Application.countDocuments(filter);

    const skip = (page - 1) * limit;

    // Fetch the applications
    const applications = await Application.find(filter)
      .populate('candidateID') // Adjust populates to your needs
      .populate('jobID')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Respond with paginated data
    return res.status(200).json({
      applications,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalApplications: total,
      statusCounts // NEW: return status counts
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export { getApplicationsByJobId };