import Application from '../../models/Application.js'
import InterviewSchedule from '../../models/Applicationlist.js';

const getApplication = async (req, res) => {
    try {
        const applicationID = req.params.id;
        const application = await Application.findById(applicationID).lean();

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const latestInterview = await InterviewSchedule.findOne({ applicationID }).sort({ createdAt: -1 }).lean();
        const applicationWithInterview = { ...application, interview: latestInterview };

        res.status(200).json(applicationWithInterview);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export { getApplication };