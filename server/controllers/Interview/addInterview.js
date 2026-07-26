import Interview from '../../models/Interview.js';

const addInterview = async (req, res) => {
  try {
    const { roundName, roundNumber, company_id } = req.body;

    const existingRoundName = await Interview.findOne({ roundName, company_id });
    if (existingRoundName) {
      return res.status(409).json({ message: "Round Name already registered." });
    }

    const newInterview = await Interview.create({
      roundName,
      roundNumber,
      company_id
    });

    res.status(201).json(newInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addInterview };
