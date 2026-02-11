import mongoose from "mongoose";
import JobStatus from "../../models/JobStatus.js";
import Job from '../../models/Job.js';

const getJobs = async (req, res) => {
    try {
        let { page = 1, limit = 12, search, title, locationType, type, scheduleType, hireType, city, status } = req.query;
        let company_id = req.headers["company_id"]?.trim();
        // Convert page & limit to numbers safely
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = Math.max(parseInt(limit, 10) || 12, 1);

        let filter = {};

        // Apply filters only if values exist
        if (locationType) filter.locationType = { $regex: locationType, $options: 'i' };
        if (city) filter.city = { $regex: city, $options: 'i' };
        if (type) filter.type = { $regex: type, $options: 'i' };
        if (scheduleType) filter.scheduleType = { $regex: scheduleType, $options: 'i' };
        if (hireType) filter.hireType = { $regex: hireType, $options: 'i' };
        if (typeof search === 'string' && search.trim() !== '') {
            filter.title = { $regex: search.trim(), $options: 'i' };
        };
        if (title) filter.title = { $regex: title, $options: 'i' };

        if (company_id) {
            const companyFilters = [{ company_id: company_id }];

            if (mongoose.Types.ObjectId.isValid(company_id)) {
                companyFilters.push({ company_id: new mongoose.Types.ObjectId(company_id) });
            }

            filter.$or = companyFilters;
        }

        // Handle status filtering
        if (status) {
            const statusNames = status.split(',').map(s => s.trim());

            // Find the corresponding JobStatus IDs for this company
            const jobStatuses = await JobStatus.find({
                jobStatus: { $in: statusNames },
                company_id: company_id
            });

            if (jobStatuses.length > 0) {
                const statusIds = jobStatuses.map(js => js._id.toString());
                filter.status = { $in: statusIds };
            } else {
                // If no matching statuses found, return no jobs (or handle as appropriate)
                // Since the frontend expects specific statuses, if they don't exist,
                // it's safer to filter for something that won't match.
                filter.status = new mongoose.Types.ObjectId();
            }
        }

        const totalCount = await Job.countDocuments(filter);

        console.log('Filter applied:', filter);
        const jobs = await Job.find(filter)
            .populate('company_id', 'name image CompanyUserName')
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        res.status(200).json({
            jobs,
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getJobs };
