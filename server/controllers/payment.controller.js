import stripe from '../config/stripe.config.js'
import Donation from '../models/donation.model.js'
import User from '../models/user.model.js'
import Cause from '../models/cause.model.js'

export const createPaymentIntent = async (req, res) => {
	const { amount, userId, causeId } = req.body

	if(!amount || amount < 0.50) return res.json({ success: false, message: 'Minimum donation amount is $0.50' })

	if(!userId) return res.json({ success: false, message: 'User not authenticated' })

	if(!causeId) return res.json({ success: false, message: 'Cause is required' })

	try{
		const user = await User.findById(userId)
		if(!user) return res.json({ success: false, message: 'User not found' })

		const cause = await Cause.findById(causeId)
		if(!cause) return res.json({ success: false, message: 'Cause not found' })

		// Create a payment intent with Stripe
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100),   // This converts the amount to cents
			currency: 'usd',                    // USD because it is standard and easy to use.
			description: `Donation by ${user.name}`,
			metadata: {
				userId: userId.toString(),
				userName: user.name,
				userEmail: user.email,
				causeId: causeId.toString(),
			},
		})

		// Donation record with pending status for MongoDB
		const donation = new Donation({
			donorId: userId,
			causeId: causeId,
			causeName: cause.name,
			amount: amount,
			status: 'pending',
			stripePaymentIntentId: paymentIntent.id,
			currency: 'usd',
			paymentMethod: 'card',
		})

		await donation.save()

		user.donations.push(donation._id)
		await user.save()

		return res.json({
			success: true,
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id,
			donationId: donation._id,
		})
	} catch (error) {
		console.error('Payment Intent Error:', error)
		return res.json({
			success: false,
			message: error.message || 'Failed to create payment intent',
		})
	}
}

export const confirmPayment = async (req, res) => {
	const { paymentIntentId, donationId, status, failureReason } = req.body

	if(!donationId) return res.json({ success: false, message: 'Missing donation details' })

	try{
		const donation = await Donation.findById(donationId)
		if(!donation) return res.json({ success: false, message: 'Donation not found' })

		let donationStatus = 'pending'
		
		// If status is explicitly provided (e.g., 'failed' from frontend), use it
		if(status === 'failed') {
			donationStatus = 'failed'
			donation.failureReason = failureReason || 'Payment declined'
		}
		// Otherwise, if paymentIntentId exists, retrieve from Stripe
		else if(paymentIntentId) {
			const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

			if(paymentIntent.status === 'succeeded') donationStatus = 'success'
			else if(paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_action') donationStatus = 'pending'
			else donationStatus = 'failed'

			if(donationStatus === 'failed'){
				donation.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed'
			}
		}

		donation.status = donationStatus
		donation.updatedAt = new Date()

		if(donationStatus === 'success'){
			// Update user's total donated amount
			const user = await User.findById(donation.donorId)
			if(user){
				user.totalDonated = (user.totalDonated || 0) + donation.amount
				await user.save()
			}
		}

		await donation.save()

		return res.json({
			success: true,
			message: `Payment ${donationStatus}`,
			donation: donation,
		})
	}
    catch(error){
		console.error('Confirm Payment Error:', error)
		return res.json({
			success: false,
			message: error.message || 'Failed to confirm payment',
		})
	}
}

export const getUserDonations = async (req, res) => {
	const userId = req.body?.userId

	if(!userId) return res.json({ success: false, message: 'User not authenticated' })

	try{
		const user = await User.findById(userId).populate({
			path: 'donations',
			model: 'Donation',
			populate: {
				path: 'causeId',
				model: 'Cause',
				select: 'name image',
			},
			options: { sort: { createdAt: -1 } },
		})

		if(!user) return res.json({ success: false, message: 'User not found' })

		// Calculate total donated from successful donations
		const successfulDonations = (user.donations || []).filter(d => d.status === 'success')
		const calculatedTotalDonated = successfulDonations.reduce((sum, d) => sum + (d.amount || 0), 0)

		// Update user's totalDonated if it's different
		if(user.totalDonated !== calculatedTotalDonated) {
			user.totalDonated = calculatedTotalDonated
			await user.save()
		}

		return res.json({
			success: true,
			donations: user.donations || [],
			totalDonated: user.totalDonated || 0,
		})
	}
    catch(error){
		console.error('Get Donations Error:', error)
		return res.json({
			success: false,
			message: error.message || 'Failed to fetch donations',
		})
	}
}

export const getDonationById = async (req, res) => {
	const { donationId } = req.params

	if(!donationId) return res.json({ success: false, message: 'Donation ID is required' })

	try{
		const donation = await Donation.findById(donationId)
			.populate({
				path: 'donorId',
				model: 'User',
				select: 'name email',
			})
			.populate('causeId')

		if(!donation) return res.json({ success: false, message: 'Donation not found' })

		return res.json({
			success: true,
			donation: donation,
		})
	}
    catch(error){
		console.error('Get Donation Error:', error)
		return res.json({
			success: false,
			message: error.message || 'Failed to fetch donation',
		})
	}
}

export const getAllDonations = async (req, res) => {
	const { userId } = req.body

	if(!userId) return res.json({ success: false, message: 'User not authenticated' })

	try{
		const user = await User.findById(userId)
		if(!user || user.role !== 'admin'){
			return res.json({ success: false, message: 'Unauthorized: Admin access required' })
		}

		const donations = await Donation
            .find()
			.populate({
				path: 'donorId',
				model: 'User',
				select: 'name email',
			})
			.populate({
				path: 'causeId',
				model: 'Cause',
				select: 'name image',
			})
			.sort({ createdAt: -1 })

		const stats = {
			totalDonations: donations.length,
			totalAmount: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
			successfulDonations: donations.filter((d) => d.status === 'success').length,
			pendingDonations: donations.filter((d) => d.status === 'pending').length,
			failedDonations: donations.filter((d) => d.status === 'failed').length,
		}

		return res.json({
			success: true,
			donations: donations,
			stats: stats,
		})
	}
    catch(error){
		console.error('Get All Donations Error:', error)
		return res.json({
			success: false,
			message: error.message || 'Failed to fetch donations',
		})
	}
}

export const handleStripeWebhook = async (req, res) => {
	const sig = req.headers['stripe-signature']
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

	let event

	try{
		event = stripe.webhooks.constructEvent(req.rawBody || JSON.stringify(req.body), sig, webhookSecret)
	}
    catch(error){
		console.error('Webhook signature verification failed:', error.message)
		return res.status(400).send(`Webhook Error: ${error.message}`)
	}

	try{
		if(event.type === 'payment_intent.succeeded') await handlePaymentIntentSucceeded(event.data.object)
		else if (event.type === 'payment_intent.payment_failed') await handlePaymentIntentFailed(event.data.object)
		else console.log(`Unhandled event type: ${event.type}`)

		res.json({ received: true })
	}
    catch(error){
		console.error('Webhook processing error:', error)
		res.status(500).json({ error: 'Webhook processing failed' })
	}
}

async function handlePaymentIntentSucceeded(paymentIntent) {
	const donation = await Donation.findOne({ stripePaymentIntentId: paymentIntent.id })

	if(donation){
		donation.status = 'success'
		donation.updatedAt = new Date()
		await donation.save()

		const user = await User.findById(donation.donorId)
		if(user){
			user.totalDonated = (user.totalDonated || 0) + donation.amount
			await user.save()
		}

		console.log(`Donation ${donation._id} succeeded`)
	}
}

async function handlePaymentIntentFailed(paymentIntent){
	const donation = await Donation.findOne({ stripePaymentIntentId: paymentIntent.id })

	if(donation){
		donation.status = 'failed'
		donation.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed'
		donation.updatedAt = new Date()
		await donation.save()

		console.log(`Donation ${donation._id} failed`)
	}
}