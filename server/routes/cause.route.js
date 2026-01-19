import express from 'express'
import {
	getAllCauses,
	createCause,
	getCauseById,
	deleteCause,
	updateCause,
} from '../controllers/cause.controller.js'
import userAuth from '../middlewares/userAuth.middleware.js'

const router = express.Router()

// Public routes
router.get('/all', getAllCauses)
router.get('/:id', getCauseById)

// Admin only routes
router.post('/create', userAuth, createCause)
router.put('/update/:id', userAuth, updateCause)
router.delete('/delete/:id', userAuth, deleteCause)

export default router
