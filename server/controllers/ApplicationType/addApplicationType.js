// import User from "../../models/User.js";
import ApplicationType from "../../models/ApplicationType.js";

const addApplicationType = async (req, res) => {
  try {
    const { applicationStep, applicationStatus, company_id } = req.body;

    // Check if email already exists
    const existingApplicationType = await ApplicationType.findOne({
      applicationStep,
    });
    if (existingApplicationType) {
      return res
        .status(409)
        .json({ message: "Application already registered." });
    }

    // Create new applicationType
    const newApplicationType = new ApplicationType({
      applicationStep,
      applicationStatus,
      company_id,
    });

    await newApplicationType.save();

    res.status(201).json(newApplicationType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addApplicationType };
