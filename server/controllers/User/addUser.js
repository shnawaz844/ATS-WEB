import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

const addUser = async (req, res) => {
  try {
    const { userName, email, password, gender, address, role, company_id } = req.body;

    const existingUser = await User.findOne({ email, company_id });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const allowedRoles = ['admin', 'recruiter_manager', 'hiring_manager', 'interviewer', 'candidate'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const newUser = await User.create({
      userName, email, password, gender, address,
      role: role || 'candidate', company_id,
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addUser };
