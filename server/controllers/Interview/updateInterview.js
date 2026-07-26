import Interview from '../../models/Interview.js';

const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { roundName, roundNumber } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    const updated = await Interview.findByIdAndUpdate(id, {
      roundName: roundName !== undefined ? roundName : interview.roundName,
      roundNumber: roundNumber !== undefined ? roundNumber : interview.roundNumber
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { updateInterview };
