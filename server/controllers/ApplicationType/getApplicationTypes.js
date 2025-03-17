import ApplicationType from "../../models/ApplicationType.js";

const getApplicationTypes = async (req, res) => {
  try {
    // Default values for page & limit
    let { page = 1, limit = 10, search = "" } = req.query;
    const { company_id } = req.headers;
    // Convert page & limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // Build a query for searching application types
    let query = {};

    if(company_id){
      query.company_id = company_id;  
    }
    
    if (search) {
      // Check if search is a number (for applicationStep)
      const isNumeric = !isNaN(parseInt(search));
      
      if (isNumeric) {
        // If search is a number, include applicationStep search
        query = {
          $or: [
            { applicationStep: parseInt(search) },
            { applicationStatus: { $regex: search, $options: "i" } }
          ]
        };
      } else {
        // If search is not a number, only search in string fields
        query = {
          applicationStatus: { $regex: search, $options: "i" }
        };
      }
    }

    // Count total documents that match the query
    const totalCount = await ApplicationType.countDocuments(query);

    // Find application types with pagination and search
    const applicationTypes = await ApplicationType.find(query)
      .sort({ applicationStep: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Send back application types array and totalCount
    res.status(200).json({
      applicationTypes,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error getting application types:", error);
    res.status(500).json({ message: "Failed to get application types" });
  }
};

export { getApplicationTypes };