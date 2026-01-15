import mongoose from 'mongoose'

const donationSchema = mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    stripePaymentIntentId: { type: String, default: '' },
    currency: { type: String, default: 'usd' },
    paymentMethod: { type: String, default: 'card' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    failureReason: { type: String, default: '' },
})

const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema)
//Good practice to write like this so that the model is first checked if it already exists and then only created.
//Model may already exist from the previous execution of the server.

export default Donation
