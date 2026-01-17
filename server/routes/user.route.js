import express from 'express'
import userAuth from '../middlewares/userAuth.middleware.js'
import { getUserData, getAllDonors } from '../controllers/user.controller.js'

const userRouter = express.Router()

userRouter.get('/data', userAuth, getUserData)
userRouter.get('/all-donors', userAuth, getAllDonors)

export default userRouter
