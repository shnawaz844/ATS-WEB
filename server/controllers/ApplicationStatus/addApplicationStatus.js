// import User from "../../models/User.js";
import ApplicationStatus from "../../models/ApplicationStatus.js";

const addApplicationStatus = async (req, res) => {
  try {
    const { applicationStep, applicationStatus, company_id } = req.body;

    // Check if email already exists
    const existingApplicationStatus = await ApplicationStatus.findOne({
      applicationStep,
    });
    if (existingApplicationStatus) {
      return res
        .status(409)
        .json({ message: "Application already registered." });
    }

    // Create new applicationSatus
    const newApplicationStatus = new ApplicationStatus({
      applicationStep,
      applicationStatus,
      company_id,
      company_id,
    });

    await newApplicationStatus.save();

    res.status(201).json(newApplicationStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addApplicationStatus };
