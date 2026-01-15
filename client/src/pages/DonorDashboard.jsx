import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import axios from 'axios'
import { toast } from 'react-toastify'

const DonorDashboard = () => {
  const { userData, backendURL } = useContext(AppContext)
  const navigate = useNavigate()
  const [donations, setDonations] = useState([])
  const [totalDonated, setTotalDonated] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)

  useEffect(() => {
    if (userData && !userData.isAccountVerified) {
      navigate('/email-verify')
    }
  }, [userData, navigate])

  // Fetch user donations on component mount
  useEffect(() => {
    if (userData && userData._id) {
      fetchUserDonations()
    }
  }, [userData])

  const fetchUserDonations = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backendURL}/api/payment/user-donations`, {
        withCredentials: true,
      })

      if (response.data.success) {
        setDonations(response.data.donations || [])
        setTotalDonated(response.data.totalDonated || 0)
      } else {
        toast.error(response.data.message || 'Failed to load donations')
      }
    } catch (error) {
      console.error('Error fetching donations:', error)
      toast.error('Error loading donations')
    } finally {
      setLoading(false)
    }
  }

  const handleDonate = async (e) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setProcessing(true)
    setPaymentStatus({ type: 'pending', message: 'Processing your donation...' })

    try {
      // Create payment intent
      const paymentResponse = await axios.post(
        `${backendURL}/api/payment/create-payment-intent`,
        { amount: parseFloat(amount), userId: userData._id },
        { withCredentials: true }
      )

      if (!paymentResponse.data.success) {
        setPaymentStatus({
          type: 'failed',
          message: paymentResponse.data.message || 'Failed to initiate payment',
        })
        toast.error('Failed to initiate payment')
        return
      }

      const { clientSecret, paymentIntentId, donationId } = paymentResponse.data

      // For demo purposes, simulate payment success after 2 seconds
      // In production, you would use Stripe.js to handle the actual payment
      setPaymentStatus({ type: 'pending', message: 'Completing payment...' })

      setTimeout(async () => {
        try {
          // Confirm payment (simulating successful payment)
          const confirmResponse = await axios.post(
            `${backendURL}/api/payment/confirm-payment`,
            { paymentIntentId, donationId, status: 'success' },
            { withCredentials: true }
          )

          if (confirmResponse.data.success) {
            setPaymentStatus({
              type: 'success',
              message: `Payment successful! Donated $${amount}`,
            })
            toast.success(`Donation of $${amount} successful!`)
            setAmount('')
            setShowPaymentForm(false)
            // Refresh donations list
            fetchUserDonations()
          } else {
            setPaymentStatus({ type: 'failed', message: confirmResponse.data.message })
            toast.error('Payment confirmation failed')
          }
        } catch (error) {
          console.error('Error confirming payment:', error)
          setPaymentStatus({
            type: 'failed',
            message: 'Error confirming payment. Please try again.',
          })
          toast.error('Error confirming payment')
        }
      }, 2000)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      setPaymentStatus({
        type: 'failed',
        message: 'Error initiating payment. Please try again.',
      })
      toast.error('Error initiating payment')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!userData || userData.role !== 'donor') {
    return <div>Access Denied</div>
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-4">Donor Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {userData.name}! Manage your donations below.</p>

        {/* Donation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Total Donated</h3>
            <p className="text-3xl font-bold text-green-600">${totalDonated.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Total Donations</h3>
            <p className="text-3xl font-bold text-blue-600">{donations.length}</p>
          </div>
        </div>

        {/* Make a Donation Button */}
        {!showPaymentForm && (
          <button
            onClick={() => setShowPaymentForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-8"
          >
            + Make a Donation
          </button>
        )}

        {/* Payment Form */}
        {showPaymentForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4">Make a Donation</h2>
            <form onSubmit={handleDonate}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                  Donation Amount ($)
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600"
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={processing}
                  required
                />
              </div>

              {/* Payment Status Messages */}
              {paymentStatus && (
                <div
                  className={`mb-4 p-4 rounded-md ${
                    paymentStatus.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : paymentStatus.type === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {paymentStatus.message}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  {processing ? 'Processing...' : 'Donate Now'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false)
                    setPaymentStatus(null)
                    setAmount('')
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Donation History */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Donation History</h2>
          {loading ? (
            <p className="text-gray-600">Loading donations...</p>
          ) : donations.length === 0 ? (
            <p className="text-gray-600">No donations yet. Make your first donation!</p>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation._id}
                  className={`border-2 p-4 rounded-lg ${getStatusColor(donation.status)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xl font-bold">${donation.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(donation.createdAt).toLocaleDateString()}{' '}
                        {new Date(donation.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                        donation.status
                      )}`}
                    >
                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </span>
                  </div>
                  {donation.status === 'failed' && donation.failureReason && (
                    <p className="text-sm text-red-700 mt-2">Reason: {donation.failureReason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DonorDashboard