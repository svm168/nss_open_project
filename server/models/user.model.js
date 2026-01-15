import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['donor', 'admin'], default: 'donor' },

	verifyOTP: { type: String, default: '' },
	verifyOTPExpireAt: { type: Number, default: 0 },

	isAccountVerified: { type: Boolean, default: false },

	resetOTP: { type: String, default: '' },
	resetOPTExpireAt: { type: Number, default: 0 },

	donations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],
	totalDonated: { type: Number, default: 0 },
})

const User = mongoose.models.User || mongoose.model('User', userSchema)
//Good practice to write like this so that the model is first checked if it already exists and then only created.
//Model may already exist from the previous execution of the server.

export default User
