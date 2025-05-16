// controllers/applicationController.js

import Application from '../../models/Application.js';

const getCandidateAppDetail = async (req, res) => {
    try {
        const { candidateId, jobId } = req.params;      // e.g., /api/applications/candidate/:candidateId
        let { page = 1, limit = 10, search = '' } = req.query;

        // Convert to numbers
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        // Define a filter
        // Only applications for this candidate
        const filter = { candidateID: candidateId, jobID: jobId };

        // Example: searching on an application's "status" field (string match)
        // Adjust as needed for your own use case
        if (search) {
            filter.status = { $regex: search, $options: 'i' };
        }

        // Get total count for pagination
        const total = await Application.countDocuments(filter);
        const skip = (page - 1) * limit;

        // Retrieve applications with pagination & population
        const applications = await Application.findOne(filter)
            .sort( { createdAt: -1 } )
            .populate('candidateID')
            .populate('jobID')
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            applications,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalApplications: total
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export { getCandidateAppDetail };
