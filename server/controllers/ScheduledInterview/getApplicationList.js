import InterviewSchedule from "../../models/Applicationlist.js";

// Function to fetch interviews
export const getInterviews = async (req, res) => {
    try {

        // Extract page and limit from query parameters, with defaults
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit to 10

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        const interviews = await InterviewSchedule
            .find()
            .populate({
                path: 'applicationID',
                select: 'jobID',
                populate: [
                    {
                        path: 'jobID',
                        select: 'title' // Selecting only the title from Job model
                    },
                    {
                        path: 'candidateID',
                        select: 'userName' // Selecting only the title from Job model
                    },
                ],
                // populate:{
                //     path: 'candidateID',
                //     select: 'userName'
                // }
            })
            .skip(skip) // Skip records based on pagination
            .limit(limit); // Limit results per page


        // Get total count for pagination
        const totalInterviews = await InterviewSchedule.countDocuments();


        res.status(200).json({
            totalPages: Math.ceil(totalInterviews / limit),
            currentPage: page,
            totalInterviews,
            interviews,
        });
    } catch (error) {
        console.error("Error fetching interviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default getInterviews;