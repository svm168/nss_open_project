import express from 'express'
import userAuth from '../middlewares/userAuth.middleware.js'
import { createPaymentIntent, confirmPayment, getUserDonations, getAllDonations, handleStripeWebhook } from '../controllers/payment.controller.js'

const paymentRouter = express.Router()

paymentRouter.post('/create-payment-intent', userAuth, createPaymentIntent)     // Creates a payment intent
paymentRouter.post('/confirm-payment', userAuth, confirmPayment)                // Confirms payment
paymentRouter.get('/user-donations', userAuth, getUserDonations)                // Gets user's donation history
paymentRouter.get('/all-donations', userAuth, getAllDonations)                  // Gets alll donations for admin
paymentRouter.post('/webhook', handleStripeWebhook)

export default paymentRouter