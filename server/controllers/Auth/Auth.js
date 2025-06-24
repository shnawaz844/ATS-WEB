import User from '../../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const register = async ( req, res ) => {
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
    const company_id = req.body.company_id || req.headers[ "company_id" ];

    if ( !company_id ) {
      return res.status( 400 ).json( { error: 'company_id is required' } );
    }

    const existingUser = await User.findOne( { email } );
    if ( existingUser ) {
      return res.status( 400 ).json( { error: 'User already exists with this email' } );
    }

    const hashPassword = await bcrypt.hashSync( password, 10 )

    const newUser = new User( { userName, email, password: hashPassword, gender, address, role, head, company_id } );

    await newUser.save();

    res.status( 201 ).json( { message: 'User created successfully', data: newUser._id } );
  }
  catch ( error ) {
    console.error( 'Error registering user:', error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
}

const login = async ( req, res ) => {
  try {
    const { password } = req.body;
    const { email } = req.body;
    const { company_id } = req.headers;
    console.log( "company_id", company_id )
    const payload = company_id === "super" ? { email, role: "super" } : { email, company_id };

    const user = await User.findOne( payload );
    if ( !user ) {
      return res.status( 400 ).json( { error: 'User not found' } );
    }

    const isPasswordValid = await bcrypt.compare( password, user.password );

    if ( !isPasswordValid ) {
      return res.status( 400 ).json( { error: 'Invalid password' } );
    }

    // const token = generateToken(user);
    const token = jwt.sign( { userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' } );
    res.cookie( 'token', token, { maxAge: 3600000, httpOnly: true } );
    res.status( 200 ).json( { success: true, message: "Login successful", user, token } );

  }
  catch ( error ) {
    console.error( 'Error registering user:', error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
}

const logout = ( req, res ) => {
  try {
    res.clearCookie( 'token' );
    res.status( 200 ).json( { success: true, message: "Logout successful" } );
  } catch ( error ) {
    console.error( 'Error logging out user:', error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
}



export { register, login, logout }