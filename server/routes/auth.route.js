import express from 'express'
import { isAuthenticated, login, bypass, logout, register, resetPassword, sendResetOTP, sendVerifyOTP, verifyEmail } from '../controllers/auth.controller.js'
import userAuth from '../middlewares/userAuth.middleware.js'

const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/bypass', bypass)
authRouter.post('/logout', logout)
authRouter.post('/send-verify-otp', userAuth, sendVerifyOTP)
authRouter.post('/verify-account', userAuth, verifyEmail)
authRouter.get('/is-auth', userAuth, isAuthenticated)
authRouter.post('/send-reset-otp', sendResetOTP)
authRouter.post('/reset-password', resetPassword)

export default authRouter