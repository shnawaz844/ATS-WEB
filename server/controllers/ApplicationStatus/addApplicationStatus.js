import ApplicationStatus from '../../models/ApplicationStatus.js';

const addApplicationStatus = async (req, res) => {
  try {
    const { applicationStep, applicationStatus, company_id } = req.body;

    const existingApplicationStatus = await ApplicationStatus.findOne({ applicationStep, company_id });
    if (existingApplicationStatus) {
      return res.status(409).json({ message: 'Application already registered.' });
    }

    const newStatus = await ApplicationStatus.create({ applicationStep, applicationStatus, company_id });
    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addApplicationStatus };
