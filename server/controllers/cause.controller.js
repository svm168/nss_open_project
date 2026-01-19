import Cause from '../models/cause.model.js'

// Get all causes
export const getAllCauses = async (req, res) => {
	try {
		const causes = await Cause.find()

		return res.json({
			success: true,
			causes: causes,
		})
	} catch (error) {
		console.error('Get All Causes Error:', error)
		return res.json({
			success: false,
			message: error.message || 'Failed to fetch causes',
		})
	}
}

// Create a new cause (Admin only)
export const createCause = async (req, res) => {
	const { name, description } = req.body
	const userId = req.body.userId

	if (!name) {
		return res.status(400).json({
			success: false,
			message: 'Cause name is required',
		})
	}

	if (!userId) {
		return res.status(401).json({
			success: false,
			message: 'User not authenticated',
		})
	}

	try {
		// Check if cause already exists
		const existingCause = await Cause.findOne({ name })
		if (existingCause) {
			return res.status(400).json({
				success: false,
				message: 'Cause with this name already exists',
			})
		}

		const newCause = new Cause({
			name,
			description: description || '',
			createdBy: userId,
		})

		await newCause.save()

		return res.json({
			success: true,
			message: 'Cause created successfully',
			cause: newCause,
		})
	} catch (error) {
		console.error('Create Cause Error:', error)
		return res.status(500).json({
			success: false,
			message: error.message || 'Failed to create cause',
		})
	}
}
export const getCauseById = async (req, res) => {
	const { id } = req.params

	try {
		const cause = await Cause.findById(id)

		if (!cause) {
			return res.json({
				success: false,
				message: 'Cause not found',
			})
		}

		return res.json({
			success: true,
			cause: cause,
		})
	} catch (error) {
		console.error('Get Cause By ID Error:', error)
		return res.json({
			success: false,
			message: error.message || 'Failed to fetch cause',
		})
	}
}

// Delete a cause (Admin only)
export const deleteCause = async (req, res) => {
	const { id } = req.params

	try {
		const cause = await Cause.findByIdAndDelete(id)

		if (!cause) {
			return res.json({
				success: false,
				message: 'Cause not found',
			})
		}

		return res.json({
			success: true,
			message: 'Cause deleted successfully',
		})
	} catch (error) {
		console.error('Delete Cause Error:', error)
		return res.json({
			success: false,
			message: error.message || 'Failed to delete cause',
		})
	}
}

// Update a cause (Admin only)
export const updateCause = async (req, res) => {
	const { id } = req.params
	const { name, description } = req.body

	try {
		const cause = await Cause.findById(id)

		if (!cause) {
			return res.status(404).json({
				success: false,
				message: 'Cause not found',
			})
		}

		if (name) cause.name = name
		if (description !== undefined) cause.description = description
		cause.updatedAt = new Date()

		await cause.save()

		return res.json({
			success: true,
			message: 'Cause updated successfully',
			cause: cause,
		})
	} catch (error) {
		console.error('Update Cause Error:', error)
		return res.status(500).json({
			success: false,
			message: error.message || 'Failed to update cause',
		})
	}
}
