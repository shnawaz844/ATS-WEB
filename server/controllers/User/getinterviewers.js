import User from '../../models/User.js';

const getInterviewers = async (req, res) => {
  try {
    let { company_id } = req.headers;

    // Filter interviewers based on the company_id
    const interviewers = await User.find({ role: 'interviewer', company_id });

    res.status(200).json(interviewers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get interviewers', error: error.message });
  }
};

export { getInterviewers };
