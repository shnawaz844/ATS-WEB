import JobStatus from "../../models/JobStatus.js";


const getJobStatuses = async (req, res) => {
  try {
    // Default values for page & limit
    let { page = 1, limit = 10, search = "" } = req.query;
    const { company_id } = req.headers;
    // Convert page & limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // Build a query for searching job statuses
    let query = {};

    if(company_id){
      query.company_id = company_id;  
    }
    
    if (search) {
      // Check if search is a number (for jobStep)
      const isNumeric = !isNaN(parseInt(search));
      
      if (isNumeric) {
        // If search is a number, include jobStep search
        query = {
          $or: [
            { jobStep: parseInt(search) },
            { jobStatus: { $regex: search, $options: "i" } }
          ]
        };
      } else {
        // If search is not a number, only search in string fields
        query = {
          jobStatus: { $regex: search, $options: "i" }
        };
      }
    }

    // Count total documents that match the query
      const totalCount = await JobStatus.countDocuments(query);

    // Find Job statuses with pagination and search
    const jobStatuses = await JobStatus.find(query)
      .sort({ jobStep: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    console.log( "jobStatuses>>><<<<<>>>>>", jobStatuses )
    // Send back job statuses array and totalCount
    res.status(200).json({
      jobStatuses,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error getting job Status:", error);
    res.status(500).json({ message: "Failed to get job status" });
  }
};

export { getJobStatuses };