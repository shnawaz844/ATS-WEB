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

        const applications = await Application.find(filter);
        res.status(200).json(applications);

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export { getApplications };
