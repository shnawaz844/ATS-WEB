import Company from '../../models/company.js';

const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { CompanyUserName, address, email, name, phone, website } = req.body;
        
        // Update the company using findByIdAndUpdate
        const updatedCompany = await Company.findByIdAndUpdate(
            id,
            { CompanyUserName, address, email, name, phone, website },
            { new: true } // Return the updated document
        );

        if (!updatedCompany) {
            return res.status(404).json({ message: "Company not found." });
        }

        return res.status(200).json({ message: "Company updated successfully.", company: updatedCompany });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { updateCompany };