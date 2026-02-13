import User from '../../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const register = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      gender,
      address,
      role,
      head,
    } = req.body;

    // Extract company_id from the body or the headers
    const company_id = req.body.company_id || req.headers["company_id"];

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const existingUser = await User.findOne({ email, company_id });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashPassword = await bcrypt.hashSync(password, 10)

    const newUser = new User({ userName, email, password: hashPassword, gender, address, role, head, company_id });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully', data: newUser._id });
  }
  catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const login = async (req, res) => {
  try {
    const { password } = req.body;
    const { email } = req.body;
    const { company_id } = req.headers;
    console.log("company_id", company_id)
    const payload = company_id === "super" ? { email, role: "super" } : { email, company_id };

    const user = await User.findOne(payload);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);


    console.log("isPasswordValid", isPasswordValid, password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // const token = generateToken(user);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });
    res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
    res.status(200).json({ success: true, message: "Login successful", user, token });

  }
  catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const logout = (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}



const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const company_id = req.headers["company_id"];

    const payload = company_id === "super" ? { email, role: "super" } : { email, company_id };
    const user = await User.findOne(payload);

    if (!user) {
      return res.status(404).json({ error: "User with this email does not exist" });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL,
          name: process.env.BREVO_SENDER_NAME,
        },
        to: [
          {
            email: email,
            name: user.userName || "User",
          },
        ],
        subject: "Password Reset Request",
        htmlContent: `
          <html>
            <body>
              <h1>Password Reset Request</h1>
              <p>Hello ${user.userName || "User"},</p>
              <p>We received a request to reset your password. Click the link below to set a new password:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>If you didn't make this request, you can safely ignore this email.</p>
            </body>
          </html>
        `,
      }),
    });

    if (response.ok) {
      res.status(200).json({ success: true, message: "Reset email sent successfully" });
    } else {
      const errorData = await response.json();
      console.error("Brevo error:", errorData);
      res.status(500).json({ error: "Failed to send email" });
    }
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    }

    // Set the new password
    const hashPassword = await bcrypt.hashSync(newPassword, 10);
    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export { register, login, logout, forgotPassword, resetPassword }
