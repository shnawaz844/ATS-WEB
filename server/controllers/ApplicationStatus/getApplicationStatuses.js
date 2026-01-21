import ApplicationStatus from "../../models/ApplicationStatus.js";


const getApplicationStatuses = async (req, res) => {
  try {
    // Default values for page & limit
    let { page = 1, limit = 10, search = "" } = req.query;
    const { company_id } = req.headers;
    // Convert page & limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // Build a query for searching application statuses
    let query = {};

    if (company_id) {
      query.company_id = company_id;
    }

    if (search) {
      // Check if search is a number (for applicationStep)
      const isNumeric = !isNaN(parseInt(search));

      const searchQuery = isNumeric
        ? {
          $or: [
            { applicationStep: parseInt(search) },
            { applicationStatus: { $regex: search, $options: "i" } }
          ]
        }
        : {
          applicationStatus: { $regex: search, $options: "i" }
        };

      // Merge searchQuery into existing query (preserving company_id)
      query = { ...query, ...searchQuery };
    }

    // Count total documents that match the query
    const totalCount = await ApplicationStatus.countDocuments(query);

    // Find application statuses with pagination and search
    const applicationStatuses = await ApplicationStatus.find(query)
      .sort({ applicationStep: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    // Send back application statuses array and totalCount
    res.status(200).json({
      applicationStatuses,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error getting application Status:", error);
    res.status(500).json({ message: "Failed to get application status" });
  }
};

export { getApplicationStatuses };