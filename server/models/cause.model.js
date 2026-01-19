import mongoose from 'mongoose'

const causeSchema = mongoose.Schema({
	name: { type: String, required: true, unique: true },
	description: { type: String, default: '' },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})

const Cause = mongoose.models.Cause || mongoose.model('Cause', causeSchema)

export default Cause
