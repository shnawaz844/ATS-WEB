import Interview from '../../models/Interview.js';

const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    await Interview.findByIdAndDelete(id);
    res.status(200).json({ message: "Interview deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete interview", error: error.message });
  }
};

export { deleteInterview };