import ApplicationStatus from '../../models/ApplicationStatus.js';

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationStep, applicationStatus, company_id } = req.body;

    const existing = await ApplicationStatus.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updated = await ApplicationStatus.findByIdAndUpdate(id, { applicationStep, applicationStatus, company_id });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { updateApplicationStatus };
