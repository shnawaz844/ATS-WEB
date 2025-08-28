import Feedback from "../../models/Feedback.js";

export const getFeedbacks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const ratingFilter = req.query.rating;

        let filter = {};

        // Add rating filter logic
        if ( ratingFilter && ratingFilter !== 'all' ) {
            if ( ratingFilter === '0' ) {
                // Filter for no rating (null, undefined, or 0)
                filter.starRating = { $in: [ null, 0, undefined ] };
            } else {
                // Filter for rating >= selected value
                const minRating = parseInt( ratingFilter );
                filter.starRating = { $gte: minRating };
            }
        }

        const feedbacks = await Feedback.find( filter )
            .skip(skip)
            .limit(limit)
            .populate("interviewId") // Optional: populate related interview details
            .populate({
                path: 'applicationID',
                select: 'jobID resume candidateID',
                populate: [
                    {
                        path: 'jobID',
                        select: 'title' // Selecting only the title from Job model
                    },
                    {
                        path: 'candidateID',
                        select: 'userName' // Selecting only the userName from Candidate model
                    },
                    
                ],
            })
            .sort( { createdAt: -1 } ); 

        const total = await Feedback.countDocuments();

        res.status(200).json({
            total,
            page,
            limit,
            feedbacks,
            hasMore: page * limit < total
        });
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        res.status(500).json({ message: "Server error" });
    }
};
