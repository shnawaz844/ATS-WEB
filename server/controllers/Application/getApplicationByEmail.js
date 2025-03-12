import Application from '../../models/Application.js';

const getApplicationByEmail = async (req, res) => {
    try {
        const email = req.params.email;
        let { page = 1, limit = 10, search = '' } = req.query;

        // Convert page & limit to numbers
        page = parseInt(page);
        limit = parseInt(limit);

        console.log('Searching for hiring manager email:', email);

        const applicationsPipeline = [
            {
                $project: {
                    jobID: 1,
                    candidateID: 1,
                    applicationStatus: 1,
                    resume: 1,
                    contactInfo: 1,
                    experience: 1,
                    questions: 1,
                    answers: 1,
                    convertedJobId: { $toObjectId: "$jobID" },
                    convertedCandidateId: { $toObjectId: "$candidateID" }
                }
            },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'convertedJobId',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'convertedCandidateId',
                    foreignField: '_id',
                    as: 'candidateDetails'
                }
            },
            { $unwind: "$jobDetails" },
            { $unwind: "$candidateDetails" },
            {
                $match: {
                    'jobDetails.hiringManagerEmail': email,
                    $or: [
                        { 'jobDetails.title': { $regex: search, $options: 'i' } },
                        { 'candidateDetails.userName': { $regex: search, $options: 'i' } }
                    ]
                }
            },
            {
                $facet: {
                    metadata: [{ $count: "totalCount" }],
                    data: [{ $skip: (page - 1) * limit }, { $limit: limit }]
                }
            }
        ];

        const result = await Application.aggregate(applicationsPipeline);
        const applications = result[0].data;
        const totalCount = result[0].metadata.length > 0 ? result[0].metadata[0].totalCount : 0;

        if (applications.length === 0) {
            return res.status(404).json({
                message: 'No applications found for this hiring manager',
                searchedEmail: email
            });
        }

        res.status(200).json({
            applications, // Make sure this is an array
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
        });
        
    } catch (error) {
        console.error('Error in pipeline:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            searchedEmail: email
        });
    }
};

export { getApplicationByEmail };
