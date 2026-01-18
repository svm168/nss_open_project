import React, { useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import CauseCard from '../components/CauseCard'
import axios from 'axios'
import { toast } from 'react-toastify'

const DonorDashboard = () => {
  const { userData, backendURL, causes } = useContext(AppContext)
  const navigate = useNavigate()
  const [donations, setDonations] = useState([])
  const [totalDonated, setTotalDonated] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const initialFetchDone = useRef(false)

  const fetchUserDonations = useCallback(async () => {
    if (!userData || !userData._id) {
      setLoading(false)
      return
    }

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
        setDonations([])
        setTotalDonated(0)
      }
    } catch (error) {
      console.error('Error fetching donations:', error)
      toast.error('Error loading donations')
      setDonations([])
      setTotalDonated(0)
    } finally {
      setLoading(false)
    }
  }, [userData, backendURL])

  useEffect(() => {
    if (userData && !userData.isAccountVerified) {
      navigate('/email-verify')
    }
  }, [userData, navigate])

  // Fetch user donations on component mount
  useEffect(() => {
    if (userData && userData._id && !initialFetchDone.current) {
      initialFetchDone.current = true
      fetchUserDonations()
    }
  }, [userData, fetchUserDonations])

  // Refetch donations when page becomes visible (user returns from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userData && userData._id) {
        fetchUserDonations()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [userData, fetchUserDonations])

  const handleCauseSelect = (cause) => {
    navigate(`/donation-payment?causeId=${cause._id}`)
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

  // Calculate donation counts by status
  const successfulDonations = donations.filter((d) => d.status === 'success').length
  const pendingDonations = donations.filter((d) => d.status === 'pending').length
  const failedDonations = donations.filter((d) => d.status === 'failed').length

  // Filter donations based on selected status
  const filteredDonations =
    statusFilter === 'all'
      ? donations
      : donations.filter((d) => d.status === statusFilter)

  if (!userData || userData.role !== 'donor') {
    return <div>Access Denied</div>
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-4">Donor Dashboard</h1>

        {/* Donation Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Total Donated</h3>
            <p className="text-3xl font-bold text-green-600">${totalDonated.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Successful Donations</h3>
            <p className="text-3xl font-bold text-green-600">{successfulDonations}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Pending Donations</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingDonations}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Failed Donations</h3>
            <p className="text-3xl font-bold text-red-600">{failedDonations}</p>
          </div>
        </div>

        {/* Choose a Cause to Donate */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Choose a Cause to Donate</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {causes.map((cause) => (
              <CauseCard
                key={cause._id}
                cause={cause}
                isClickable={true}
                isSelected={false}
                onClick={handleCauseSelect}
              />
            ))}
          </div>
        </div>

        {/* Donation History */}
        <div>
          <div className="flex justify-between items-center mb-6 mx-12">
            <h2 className="text-2xl font-semibold">Donation History</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white font-medium"
            >
              <option value="all">All</option>
              <option value="success">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          {loading ? (
            <p className="text-gray-600">Loading donations...</p>
          ) : filteredDonations.length === 0 ? (
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? 'No donation history'
                : `No ${statusFilter} donations`}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredDonations.map((donation) => (
                <div
                  key={donation._id}
                  className={`border-2 p-4 mx-20 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(donation.status)}`}
                  onClick={() => navigate(`/payment-confirmation/${donation._id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className='ml-4'>
                          <p className="text-lg font-bold">${donation.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {donation.causeName && (
                          <div className="ml-4 flex gap-x-4">
                            <p className="text-gray-600 font-semibold">Cause:</p>
                            <p className="text-gray-800 capitalize font-medium">
                              {donation.causeName.replace(/_/g, ' ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full mr-4 font-semibold whitespace-nowrap ${getStatusBadgeColor(
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