import User from "../models/user.model.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body

        const user = await User.findById(userId)

        if(!user){
            return res.json({ success: false, message: 'User not found.' })
        }

        return res.json({ success: true, userData: {
            _id: user._id,
            name: user.name,
            email: user.email,      // sending email also to show in profile page
            isAccountVerified: user.isAccountVerified,
            role: user.role,
            adminApprovalStatus: user.adminApprovalStatus
        }})
    } catch (error) {
        return res.json({ success: false, message: error.message})
    }
}

export const getAllDonors = async (req, res) => {
    try {
        const donors = await User.find({ role: 'donor' }).select('_id name email isAccountVerified registeredDate')

        return res.json({
            success: true,
            donors: donors,
            totalDonors: donors.length,
        })
    } catch (error) {
        console.error('Get All Donors Error:', error)
        return res.json({
            success: false,
            message: error.message || 'Failed to fetch donors',
        })
    }
}