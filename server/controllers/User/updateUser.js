// controllers/User/updateUser.js

import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

const updateUser = async ( req, res ) => {
  try {
    const { _id, userName, email, password, gender, address, role, company_id } = req.body;
    const { id } = req.params;

    console.log( "Update request111111", req.params )
    console.log( "Update request received:", req.body ); // Debug log

    if ( !id ) {
      return res.status( 400 ).json( {
        success: false,
        message: 'User ID is required',
      } );
    }

    const user = await User.findById( id );
    if ( !user ) {
      return res.status( 404 ).json( {
        success: false,
        message: 'User not found',
      } );
    }

    // Update only if the field is provided, else keep existing
    if ( userName !== undefined && userName.trim() ) {
      user.userName = userName.trim();
    }
    if ( email !== undefined && email.trim() ) {
      user.email = email.trim();
    }
    if ( password !== undefined && password.trim() ) {
      // Hash the new password
      const saltRounds = 10;
      user.password = await bcrypt.hash( password, saltRounds );
    }
    if ( gender !== undefined ) {
      user.gender = gender;
    }
    if ( address !== undefined ) {
      user.address = address;
    }
    if ( role !== undefined ) {
      user.role = role;
    }
    if ( company_id !== undefined ) {
      user.company_id = company_id;
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Return success response (don't send password back)
    const userResponse = {
      _id: updatedUser._id,
      userName: updatedUser.userName,
      email: updatedUser.email,
      role: updatedUser.role,
      gender: updatedUser.gender,
      address: updatedUser.address,
      company_id: updatedUser.company_id,
    };

    res.status( 200 ).json( {
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    } );

  } catch ( error ) {
    console.error( "Update user error:", error );
    res.status( 500 ).json( {
      success: false,
      message: error.message || 'Internal server error'
    } );
  }
};

export { updateUser };