import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, email, password, gender, address, role, company_id } = req.body;

    if (!id) return res.status(400).json({ success: false, message: 'User ID is required' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updateData = {};
    if (userName?.trim()) updateData.userName = userName.trim();
    if (email?.trim()) updateData.email = email.trim();
    if (password?.trim()) updateData.password = await bcrypt.hash(password, 10);
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (role !== undefined) updateData.role = role;
    if (company_id !== undefined) updateData.company_id = company_id;

    const updatedUser = await User.findByIdAndUpdate(id, updateData);

    res.status(200).json({
      success: true, message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id, userName: updatedUser.userName, email: updatedUser.email,
        role: updatedUser.role, gender: updatedUser.gender, address: updatedUser.address, company_id: updatedUser.company_id,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export { updateUser };