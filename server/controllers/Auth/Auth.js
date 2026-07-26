import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import supabase from '../../config/supabaseClient.js';

const register = async (req, res) => {
  try {
    const { userName, email, password, gender, address, role, head } = req.body;
    const company_id = req.body.company_id || req.headers['company_id'];

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const existingUser = await User.findOne({ email, company_id });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      userName, email, password: hashPassword, gender, address, role, head, company_id
    });

    res.status(201).json({ message: 'User created successfully', data: newUser._id });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { company_id } = req.headers;

    const payload = (company_id === 'super' || !company_id)
      ? { email }
      : { email, company_id };

    const user = await User.findOne(payload);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    if (company_id === 'super' || user.company_id === 'super' || user.head === true || user.email === 'karamveer@gmail.com' || user.email === 'shahnawaz95577@gmail.com' || user.email === 'admin@ats.com') {
      user.role = 'super';
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });
    res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
    res.status(200).json({ success: true, message: 'Login successful', user, token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const company_id = req.headers['company_id'];

    const payload = company_id === 'super' ? { email, role: 'admin' } : { email, company_id };
    const user = await User.findOne(payload);

    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: token,
      resetPasswordExpires: new Date(Date.now() + 3600000).toISOString()
    });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME },
        to: [{ email, name: user.userName || 'User' }],
        subject: 'Password Reset Request',
        htmlContent: `<html><body><h1>Password Reset Request</h1><p>Hello ${user.userName || 'User'},</p><p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't make this request, ignore this email.</p></body></html>`,
      }),
    });

    if (response.ok) {
      res.status(200).json({ success: true, message: 'Reset email sent successfully' });
    } else {
      const errorData = await response.json();
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with matching reset token that hasn't expired
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('"resetPasswordToken"', token)
      .gt('"resetPasswordExpires"', new Date().toISOString())
      .limit(1);

    if (error || !users || users.length === 0) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    const user = users[0];
    const hashPassword = bcrypt.hashSync(newPassword, 10);

    await User.findByIdAndUpdate(user.id, {
      password: hashPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { register, login, logout, forgotPassword, resetPassword };
