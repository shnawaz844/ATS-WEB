import Company from '../../models/company.js';

export const getCompanyUserName = async (req, res) => {
  try {
    const { CompanyUserName } = req.params;
    console.log("CompanyUserName>>>", CompanyUserName);
    const company = await Company.findOne({ CompanyUserName });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ message: 'Server error while fetching company details' });
  }
};

export default getCompanyUserName;
