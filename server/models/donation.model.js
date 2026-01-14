import mongoose from 'mongoose'

const donationSchema = mongoose.Schema({
    donorId: {type: String, required: true},
    amount: {type: Number, default: 0},
    status: {type: String, enum: ['success', 'pending', 'failed']},
    // name: { type: String, required: true },
    // email: { type: String, required: true },
    // password: { type: String, required: true },
    // role: { type: String, enum: ['donor', 'admin'], default: 'donor' },

    // verifyOTP: { type: String, default: '' },
    // verifyOTPExpireAt: { type: Number, default: 0 },

    // isAccountVerified: { type: Boolean, default: false },

    // resetOTP: { type: String, default: '' },
    // resetOPTExpireAt: { type: Number, default: 0 },
})

const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema)
//Good practice to write like this so that the model is first checked if it already exists and then only created.
//Model may already exist from the previous execution of the server.

export default Donation
