import Company from '../../models/company.js';
import supabase from '../../config/supabaseClient.js';

const deleteCompany = async (req, res) => {
  try {
    const { CompanyUserName } = req.params;

    const company = await Company.findOne({ CompanyUserName });
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('CompanyUserName', CompanyUserName);
    
    if (error) throw error;

    res.status(200).json({ message: "Company deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { deleteCompany };