import Interview from '../../models/Interview.js';

const getInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: "Failed to get interview" });
  }
};

export { getInterview };