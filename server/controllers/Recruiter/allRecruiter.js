import User from '../../models/User.js'

const allRecruiter = async (req, res) => {
    try {
        const companyId = req.headers[ 'company_id' ];  // Get the company_id from request headers

        if ( !companyId ) {
            return res.status( 400 ).json( { message: 'company_id is required' } );
        }
        const recruiter = await User.find( { role: 'recruiter_manager', head: false,company_id: companyId } );
        res.status(200).json(recruiter);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export {allRecruiter};