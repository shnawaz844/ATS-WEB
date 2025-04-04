import Interview from '../../models/Interview.js';
import User from '../../models/User.js';

const addInterview = async (req, res) => {
  try {
    const { roundName, roundNumber, company_id } = req.body;

    // Check if roundName already exists
    const existingRoundName = await Interview.findOne({ roundName });
    if (existingRoundName) {
      return res
      .status(409)
      .json({ message: "Round Name already registered." });
    }

    // // Validate role field against allowed enum values
    // const allowedRoles = ["admin", "recruiter_manager", "hiring_manager", "interviewer", "candidate"];
    // if (role && !allowedRoles.includes(role)) {
    //   return res.status(400).json({ message: "Invalid role specified." });
    // }

    // Create new user
    const newInterview = new Interview({
      roundName,
      roundNumber,
      company_id
    });

    await newInterview.save();

    res.status(201).json(newInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addInterview };
