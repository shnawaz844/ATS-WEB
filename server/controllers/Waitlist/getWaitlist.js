import Waitlist from '../../models/Waitlist.js';

export const getWaitlist = async (req, res) => {
  try {
    const companyId = req.headers['company_id'] || req.query.companyId || req.body.companyId;
    
    const waitlist = await Waitlist.findAll(companyId);
    
    return res.status(200).json({
      success: true,
      data: waitlist
    });
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
