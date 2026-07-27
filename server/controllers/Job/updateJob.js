import Job from '../../models/Job.js';

const updateJob = async (req, res) => {
  try {
    const {
      _id,
      title,
      locationType,
      type,
      scheduleType,
      shiftStart,
      shiftEnd,
      hireType,
      country,
      state,
      city,
      description,
      compensation,
      experienceRequired,
      requiredResources,
      status,
      recruiterName,
      hiringManagerEmail,
      hiringManagerName,
      applicationForm,
      applicants,
      skillsRequired,
    } = req.body;

    const updatedJob = await Job.findByIdAndUpdate(
      _id,
      {
        title,
        locationType,
        type,
        scheduleType,
        shiftStart,
        shiftEnd,
        hireType,
        country,
        state,
        city,
        description,
        compensation,
        experienceRequired: experienceRequired || [],
        requiredResources,
        status,
        recruiterName,
        hiringManagerEmail,
        hiringManagerName,
        applicationForm,
        applicants,
        skillsRequired: skillsRequired || [],
      }
    );

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { updateJob };
