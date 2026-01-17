import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import axios from 'axios'
import { toast } from 'react-toastify'

const PaymentConfirmation = () => {
  const { userData, backendURL } = useContext(AppContext)
  const { donationId } = useParams()
  const navigate = useNavigate()
  const [donation, setDonation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userData && !userData.isAccountVerified) {
      navigate('/email-verify')
    }
  }, [userData, navigate])

  useEffect(() => {
    if (donationId) {
      fetchDonationDetails()
    }
  }, [donationId])

  const fetchDonationDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${backendURL}/api/payment/donation/${donationId}`,
        { withCredentials: true }
      )

      if (response.data.success) {
        setDonation(response.data.donation)
      } else {
        toast.error(response.data.message || 'Failed to load donation details')
        navigate('/donor-dashboard')
      }
    } catch (error) {
      console.error('Error fetching donation:', error)
      toast.error('Error loading donation details')
      navigate('/donor-dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return '✓'
      case 'pending':
        return '⏳'
      case 'failed':
        return '✗'
      default:
        return '•'
    }
  }

  if (!userData || userData.role !== 'donor') {
    return <div>Access Denied</div>
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Loading donation details...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!donation) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">Donation details not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Status Banner */}
          <div
            className={`mb-8 p-6 rounded-lg text-center ${
              donation.status === 'success'
                ? 'bg-green-50 border-2 border-green-200'
                : donation.status === 'failed'
                  ? 'bg-red-50 border-2 border-red-200'
                  : 'bg-yellow-50 border-2 border-yellow-200'
            }`}
          >
            <div className={`text-4xl mb-2 ${getStatusColor(donation.status)}`}>
              {getStatusIcon(donation.status)}
            </div>
            <h1 className={`text-2xl font-bold ${getStatusColor(donation.status)} mb-2`}>
              {donation.status === 'success'
                ? 'Donation Successful!'
                : donation.status === 'failed'
                  ? 'Donation Failed'
                  : 'Payment Pending'}
            </h1>
            <p className="text-gray-600">
              {donation.status === 'success'
                ? 'Thank you for your generous donation!'
                : donation.status === 'failed'
                  ? 'Unfortunately, your payment could not be processed.'
                  : 'Your payment is being processed.'}
            </p>
          </div>

          {/* Donation Details Card */}
          <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Donation Details</h2>

            <div className="space-y-4">
              {/* Cause */}
              {donation.causeName && (
                <div className="border-b pb-4">
                  <p className="text-gray-600 text-sm font-semibold mb-1">Donation Cause</p>
                  <p className="text-lg text-gray-800">{donation.causeName}</p>
                </div>
              )}

              {/* Transaction ID */}
              <div className="border-b pb-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">Transaction ID</p>
                <p className="text-lg font-mono text-gray-800">{donation._id}</p>
              </div>

              {/* Amount */}
              <div className="border-b pb-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">Amount Donated</p>
                <p className="text-3xl font-bold text-green-600">
                  ${donation.amount.toFixed(2)}
                </p>
              </div>

              {/* Donor Name */}
              <div className="border-b pb-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">Donor Name</p>
                <p className="text-lg text-gray-800">{userData.name}</p>
              </div>

              {/* Status */}
              <div className="border-b pb-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">Payment Status</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    donation.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : donation.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                </span>
              </div>

              {/* Payment Method */}
              <div className="border-b pb-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">Payment Method</p>
                <p className="text-lg text-gray-800 capitalize">{donation.paymentMethod}</p>
              </div>

              {/* Currency */}
              <div className="border-b pb-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">Currency</p>
                <p className="text-lg text-gray-800 uppercase">{donation.currency}</p>
              </div>

              {/* Date & Time */}
              <div className="border-b pb-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">Date & Time</p>
                <p className="text-lg text-gray-800">
                  {new Date(donation.createdAt).toLocaleDateString()} at{' '}
                  {new Date(donation.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {/* Stripe Payment Intent ID */}
              {donation.stripePaymentIntentId && (
                <div className="pb-4">
                  <p className="text-gray-600 text-sm font-semibold mb-1">Stripe Payment ID</p>
                  <p className="text-sm font-mono text-gray-600">{donation.stripePaymentIntentId}</p>
                </div>
              )}

              {/* Failure Reason */}
              {donation.status === 'failed' && donation.failureReason && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-gray-600 text-sm font-semibold mb-1">Failure Reason</p>
                  <p className="text-red-800">{donation.failureReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/donor-dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentConfirmation
