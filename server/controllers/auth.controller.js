import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from '../models/user.model.js'
import transporter from '../config/nodemailer.config.js'

import { Email_vefify_template, Password_reset_template, Admin_approval_request_template, Admin_approval_notification_template } from '../config/emailTemplate.config.js'

export const register = async (req, res) => {
	const { name, email, password, role } = req.body

	if (!name || !email || !password) {
		return res.json({ success: false, message: 'Missing Details.' })
	}

	try {
		const existingUser = await User.findOne({ email, role })
		if (existingUser) {
			return res.json({
				success: false,
				message: 'A user with this email and role already exists.'
			})
		}

		const hashedPwd = await bcrypt.hash(password, 10)

		const user = new User({ name, email, password: hashedPwd, role: role || 'donor' })
		await user.save()

		const token = jwt.sign({ id: user._id }, process.env.JWT_SEC_KEY, {
			expiresIn: '7d',
		})
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		return res.json({ success: true })
	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}

export const login = async (req, res) => {
	const { email, password, role } = req.body

	if (!email || !password) {
		return res.json({
			success: false,
			message: 'Please enter the E-mail and Password.',
		})
	}

	try {
		const user = await User.findOne({ email, role })

		if (!user) {
			return res.json({
				success: false,
				message: 'No account with this email and role exists. Please Sign Up.',
			})
		}

		const matches = await bcrypt.compare(password, user.password)

		if (!matches) {
			return res.json({
				success: false,
				message: 'Invalid E-mail or Password.',
			})
		}

		if(role === 'admin' && user.adminApprovalStatus === 'pending') {
			return res.json({
				success: false,
				message: 'Your admin access is pending approval from the owner. Please wait for confirmation.',
			})
		}
		if(role === 'admin' && user.adminApprovalStatus === 'denied') {
			return res.json({
				success: false,
				message: 'Your admin access request has been denied. Please contact the owner for more information.',
			})
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SEC_KEY, {
			expiresIn: '7d',
		})
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		return res.json({ success: true })
	} catch (error) {
		return res.json({ success: false, message: error.message })
	}
}

export const logout = async (req, res) => {
	try {
		res.clearCookie('token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
		})

		return res.json({ success: true, message: 'Logged Out' })
	} catch (error) {
		return res.json({ success: false, message: error.message })
	}
}

export const sendVerifyOTP = async (req, res) => {
	try {
		const {userId} = req.body;
		const user = await User.findById(userId)

		if(user.isAccountVerified){
			return res.json({success: false, message: 'Account already verified.'})
		}

		const otp = String(Math.floor( 100000 + Math.random()*900000 ))

		user.verifyOTP = otp
		user.verifyOTPExpireAt = Date.now() + 24 * 60 * 60 * 1000
		await user.save()

		const mailOptions = {
			from: process.env.SENDER_EMAIL,
			to: user.email,
			subject: 'Account verification OTP',
			html: Email_vefify_template.replace("{{otp}}", otp).replace("{{email}}", user.email)
		}
		await transporter.sendMail(mailOptions)

		res.json({ success: true, message: 'OTP sent on E-mail.' })

	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}

export const verifyEmail = async (req, res) => {
	const { userId, otp } = req.body

	if(!userId || !otp){
		return res.json({ success: false, message: 'Missing details.' })
	}

	try {
		const user = await User.findById(userId)

		if(!user){
			return res.json({ success: false, message: 'User not found.' })
		}

		if(user.verifyOTP === '' || user.verifyOTP !== otp){
			return res.json({ success: false, message: 'Invalid OTP' })
		}

		if(user.verifyOTPExpireAt < Date.now()){
			return res.json({ success: false, message: 'OTP expired' })
		}

		user.isAccountVerified = true
		user.registeredDate = new Date()
		user.verifyOTP = ''
		user.verifyOTPExpireAt = 0

		// If user is registering as admin, set approval status to pending
		if(user.role === 'admin') {
			user.adminApprovalStatus = 'pending'
		}

		await user.save()

		// If admin, send approval request to owner
		if(user.role === 'admin') {
			const ownerEmail = process.env.OWNER_EMAIL
			if(ownerEmail) {
				const approvalToken = jwt.sign({ userId: user._id, action: 'approve' }, process.env.JWT_SEC_KEY, {
					expiresIn: '30d',
				})
				const denialToken = jwt.sign({ userId: user._id, action: 'deny' }, process.env.JWT_SEC_KEY, {
					expiresIn: '30d',
				})

				const appUrl = process.env.CLIENT_URL || 'http://localhost:5173'
				const approveLink = `${appUrl}/admin-approval?token=${approvalToken}`
				const denyLink = `${appUrl}/admin-approval?token=${denialToken}`

				const mailOptions = {
					from: process.env.SENDER_EMAIL,
					to: ownerEmail,
					subject: 'New Admin Access Request',
					html: Admin_approval_request_template
						.replace("{{name}}", user.name)
						.replace("{{email}}", user.email)
						.replace("{{appliedDate}}", new Date().toLocaleString())
						.replace("{{approveLink}}", approveLink)
						.replace("{{denyLink}}", denyLink)
				}

				try {
					await transporter.sendMail(mailOptions)
				} catch (emailError) {
					console.error('Error sending admin approval request email:', emailError)
				}
			}

			return res.json({ success: true, message: 'E-mail verified successfully. Waiting for admin approval.' })
		}

		const mailOptions = {
			from: process.env.SENDER_EMAIL,
			to: user.email,
			subject: 'Welcome to my NGO website! Support humanity!',
			text: `Alone we can do so little, together we can do so much.`
		}

		try {
			await transporter.sendMail(mailOptions)
		} catch (emailError) {
			console.error('Error sending welcome email:', emailError)
		}

		return res.json({ success: true, message: 'E-mail verified successfully.' })
	} catch (error) {
		return res.json({ success: false, message: error.message })
	}
}

export const isAuthenticated = async (req, res) => {
	try {
		return res.json({ success: true })
	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}

export const sendResetOTP = async (req, res) => {
	const { email } = req.body

	if(!email){
		return res.json({ success: false, message: 'E-mail is required.' })
	}

	try {
		const user = await User.findOne({ email })
		if(!user){
			return res.json({ success: false, message: 'No user with this E-mail exists.' })
		}

		const otp = String(Math.floor( 100000 + Math.random()*900000 ))

		user.resetOTP = otp
		user.resetOPTExpireAt = Date.now() + 15 * 60 * 1000
		await user.save()

		const mailOptions = {
			from: process.env.SENDER_EMAIL,
			to: user.email,
			subject: 'Password Reset OTP',
			html: Password_reset_template.replace("{{otp}}", otp).replace("{{email}}", user.email)
		}
		await transporter.sendMail(mailOptions)

		res.json({ success: true, message: 'OTP sent on E-mail.' })

	} catch (error) {
		return res.json({ success: false, message: error.message})
	}
}

export const resetPassword = async (req, res) => {
	const {email, otp, newPassword} = req.body

	if(!email || !otp || !newPassword){
		return res.json({ success: false, message: 'E-mail, OTP and New password are required.' })
	}

	try {
		const user = await User.findOne({ email })
		if(!user){
			return res.json({ success: false, message: 'No user with this E-mail exists.'})
		}

		if(user.resetOTP === '' || user.resetOTP !== otp){
			return res.json({ success: false, message: 'Invalid OTP'})
		}

		if(user.resetOPTExpireAt < Date.now()){
			return res.json({ success: false, message: 'OTP Expired.' })
		}

		const hashedPwd = await bcrypt.hash(newPassword, 10)
		user.password = hashedPwd
		user.resetOTP = ''
		user.resetOPTExpireAt = 0
		await user.save()

		return res.json({ success: true, message: 'Password reset successfully.' })
	} catch (error) {
		return res.json({ success: false, message: error.message })
	}
}

export const approveAdmin = async (req, res) => {
	try {
		const { token } = req.body

		if(!token) {
			return res.json({ success: false, message: 'Token is required.' })
		}

		let decoded
		try {
			decoded = jwt.verify(token, process.env.JWT_SEC_KEY)
		} catch (error) {
			return res.json({ success: false, message: 'Invalid or expired token.' })
		}

		if(decoded.action !== 'approve') {
			return res.json({ success: false, message: 'Invalid token.' })
		}

		const user = await User.findById(decoded.userId)

		if(!user) {
			return res.json({ success: false, message: 'User not found.' })
		}

		if(user.role !== 'admin') {
			return res.json({ success: false, message: 'This user is not an admin applicant.' })
		}

		user.adminApprovalStatus = 'approved'
		user.approvedDate = new Date()
		await user.save()

		const mailOptions = {
			from: process.env.SENDER_EMAIL,
			to: user.email,
			subject: 'Admin Access Approved',
			html: Admin_approval_notification_template
				.replace("{{status}}", 'Admin Access Approved ✓')
				.replace("{{message}}", `Congratulations! Your admin access has been approved. You can now log in and start managing the platform.`)
		}

		try {
			await transporter.sendMail(mailOptions)
		} catch (emailError) {
			console.error('Error sending approval notification email:', emailError)
		}

		return res.json({ success: true, message: 'Admin has been approved successfully.' })
	} catch (error) {
		return res.json({ success: false, message: error.message })
	}
}

export const denyAdmin = async (req, res) => {
	try {
		const { token } = req.body

		if(!token) {
			return res.json({ success: false, message: 'Token is required.' })
		}

		let decoded
		try {
			decoded = jwt.verify(token, process.env.JWT_SEC_KEY)
		} catch (error) {
			return res.json({ success: false, message: 'Invalid or expired token.' })
		}

		if(decoded.action !== 'deny') {
			return res.json({ success: false, message: 'Invalid token.' })
		}

		const user = await User.findById(decoded.userId)

		if(!user) {
			return res.json({ success: false, message: 'User not found.' })
		}

		if(user.role !== 'admin') {
			return res.json({ success: false, message: 'This user is not an admin applicant.' })
		}

		user.adminApprovalStatus = 'denied'
		await user.save()

		const mailOptions = {
			from: process.env.SENDER_EMAIL,
			to: user.email,
			subject: 'Admin Access Denied',
			html: Admin_approval_notification_template
				.replace("{{status}}", 'Admin Access Denied')
				.replace("{{message}}", `Your admin access request has been denied. If you have questions, please contact the owner.`)
		}

		try {
			await transporter.sendMail(mailOptions)
		} catch (emailError) {
			console.error('Error sending denial notification email:', emailError)
		}

		return res.json({ success: true, message: 'Admin request has been denied.' })
	} catch (error) {
		return res.json({ success: false, message: error.message })
	}
}