import ApplicationStatus from "../../models/ApplicationStatus.js";

const deleteApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    await ApplicationStatus.findByIdAndDelete(id);
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete application", error: error.message });
  }
};

export { deleteApplicationStatus };
