import mongoose from "mongoose";
import Application from '../../models/Application.js'

const getApplications = async (req, res) => {
    try {
        let company_id = req.headers["company_id"]?.trim();
        let filter = {};

        if (company_id) {
            const companyFilters = [{ company_id: company_id }];

            if (mongoose.Types.ObjectId.isValid(company_id)) {
                companyFilters.push({ company_id: new mongoose.Types.ObjectId(company_id) });
            }

            filter.$or = companyFilters;
        }

        let applications = await Application.find(filter).lean();

        // Manually fetch job titles if populate fails or for more resilience
        const jobIds = [...new Set(applications.map(app => app.jobID))];
        const jobs = await mongoose.model('Job').find({
            $or: [
                { _id: { $in: jobIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } },
                { jobID: { $in: jobIds.map(id => id.toString()) } }
            ]
        }).select('title jobID _id').lean();

        const jobLookup = {};
        jobs.forEach(job => {
            jobLookup[job._id.toString()] = job.title;
            jobLookup[job.jobID] = job.title;
        });

        applications = applications.map(app => ({
            ...app,
            jobTitle: app.jobTitle || jobLookup[app.jobID?.toString()] || 'Unknown Job',
            jobID: jobs.find(j => j._id.toString() === app.jobID?.toString() || j.jobID === app.jobID?.toString()) || app.jobID
        }));

        res.status(200).json(applications);

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export { getApplications };
