import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import axios from 'axios'
import { toast } from 'react-toastify'

const AdminDashboard = () => {
  const { userData, backendURL } = useContext(AppContext)
  const navigate = useNavigate()
  const [donations, setDonations] = useState([])
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    successfulDonations: 0,
    pendingDonations: 0,
    failedDonations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (userData && !userData.isAccountVerified) {
      navigate('/email-verify')
    }
  }, [userData, navigate])

  // Fetch all donations on component mount
  useEffect(() => {
    if (userData && userData._id) {
      fetchAllDonations()
    }
  }, [userData])

  const fetchAllDonations = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backendURL}/api/payment/all-donations`, {
        withCredentials: true,
      })

      if (response.data.success) {
        setDonations(response.data.donations || [])
        setStats(response.data.stats || {})
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

  const filteredDonations =
    filterStatus === 'all' ? donations : donations.filter((d) => d.status === filterStatus)

  if (!userData || userData.role !== 'admin') {
    return <div>Access Denied</div>
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {userData.name}! Manage all system donations.</p>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-xs font-semibold uppercase">Total Donations</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalDonations || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-xs font-semibold uppercase">Total Amount</h3>
            <p className="text-2xl font-bold text-green-600">
              ${(stats.totalAmount || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-xs font-semibold uppercase">Successful</h3>
            <p className="text-2xl font-bold text-green-500">{stats.successfulDonations || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-xs font-semibold uppercase">Pending</h3>
            <p className="text-2xl font-bold text-yellow-500">{stats.pendingDonations || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-xs font-semibold uppercase">Failed</h3>
            <p className="text-2xl font-bold text-red-500">{stats.failedDonations || 0}</p>
          </div>
        </div>

        {/* Filter and Refresh */}
        <div className="mb-6 flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Donations</option>
            <option value="success">Successful Only</option>
            <option value="pending">Pending Only</option>
            <option value="failed">Failed Only</option>
          </select>
          <button
            onClick={fetchAllDonations}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh
          </button>
        </div>

        {/* Donations List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            All Donations ({filteredDonations.length})
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading donations...</p>
          ) : filteredDonations.length === 0 ? (
            <p className="text-gray-600">
              No {filterStatus !== 'all' ? filterStatus : ''} donations found.
            </p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-700">Donor</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((donation) => (
                    <tr key={donation._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        {donation.donorId?.name || 'Unknown Donor'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {donation.donorId?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        ${donation.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                            donation.status
                          )}`}
                        >
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800 font-semibold">
                            View
                          </summary>
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <p>
                              <strong>Payment ID:</strong> {donation.stripePaymentIntentId}
                            </p>
                            <p>
                              <strong>Donation ID:</strong> {donation._id}
                            </p>
                            <p>
                              <strong>Created:</strong>{' '}
                              {new Date(donation.createdAt).toLocaleString()}
                            </p>
                            <p>
                              <strong>Updated:</strong>{' '}
                              {new Date(donation.updatedAt).toLocaleString()}
                            </p>
                            {donation.failureReason && (
                              <p className="text-red-600">
                                <strong>Failure Reason:</strong> {donation.failureReason}
                              </p>
                            )}
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard