import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import CauseCard from '../components/CauseCard'
import axios from 'axios'
import { toast } from 'react-toastify'

const AdminDashboard = () => {
  const { userData, backendURL, causes, fetchCauses } = useContext(AppContext)
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
  const [filterCause, setFilterCause] = useState('all')
  const [activeTab, setActiveTab] = useState('donations')
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  
  // Users state
  const [donors, setDonors] = useState([])
  
  // Cause form states
  const [showCauseForm, setShowCauseForm] = useState(false)
  const [causeName, setCauseName] = useState('')
  const [causeImage, setCauseImage] = useState(null) // Changed to null for file
  const [causeImagePreview, setCauseImagePreview] = useState(null) // Preview URL
  const [causeDescription, setCauseDescription] = useState('')
  const [creatingCause, setCreatingCause] = useState(false)

  useEffect(() => {
    if (userData && !userData.isAccountVerified) {
      navigate('/email-verify')
    }
  }, [userData, navigate])

  // Fetch all donations on component mount
  useEffect(() => {
    if (userData && userData._id) {
      fetchAllDonations()
      fetchAllDonors()
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

  const fetchAllDonors = async () => {
    try {
      const response = await axios.get(`${backendURL}/api/user/all-donors`, {
        withCredentials: true,
      })

      if (response.data.success) {
        setDonors(response.data.donors || [])
      } else {
        toast.error(response.data.message || 'Failed to load donors')
      }
    } catch (error) {
      console.error('Error fetching donors:', error)
      toast.error('Error loading donors')
    }
  }

  const handleCreateCause = async (e) => {
    e.preventDefault()

    if (!causeName.trim()) {
      toast.error('Please enter cause name')
      return
    }

    setCreatingCause(true)

    try {
      const formData = new FormData()
      formData.append('name', causeName)
      formData.append('description', causeDescription)
      formData.append('userId', userData._id)
      if (causeImage) {
        formData.append('image', causeImage)
      }

      const response = await axios.post(
        `${backendURL}/api/cause/create`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (response.data.success) {
        toast.success('Cause created successfully!')
        setCauseName('')
        setCauseImage(null)
        setCauseImagePreview(null)
        setCauseDescription('')
        setShowCauseForm(false)
        fetchCauses()
      } else {
        toast.error(response.data.message || 'Failed to create cause')
      }
    } catch (error) {
      console.error('Error creating cause:', error)
      toast.error('Error creating cause')
    } finally {
      setCreatingCause(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      setCauseImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setCauseImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setCauseImage(null)
    setCauseImagePreview(null)
  }

  const handleDeleteCause = async (causeId) => {
    if (!window.confirm('Are you sure you want to delete this cause?')) {
      return
    }

    try {
      const response = await axios.delete(
        `${backendURL}/api/cause/delete/${causeId}`,
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success('Cause deleted successfully!')
        fetchCauses()
      } else {
        toast.error(response.data.message || 'Failed to delete cause')
      }
    } catch (error) {
      console.error('Error deleting cause:', error)
      toast.error('Error deleting cause')
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

  // Export functions
  const exportToCSV = () => {
    if (donors.length === 0) {
      toast.error('No donors data to export')
      return
    }

    const headers = ['Name', 'Email', 'Verification Status', 'Registered Date']
    const rows = donors.map((donor) => [
      donor.name,
      donor.email,
      donor.isAccountVerified ? 'Verified' : 'Not Verified',
      donor.registeredDate ? new Date(donor.registeredDate).toLocaleDateString() : 'N/A',
    ])

    let csv = headers.join(',') + '\n'
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(',') + '\n'
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donors-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Donors data exported as CSV')
  }

  const exportToJSON = () => {
    if (donors.length === 0) {
      toast.error('No donors data to export')
      return
    }

    const data = donors.map((donor) => ({
      name: donor.name,
      email: donor.email,
      verificationStatus: donor.isAccountVerified ? 'Verified' : 'Not Verified',
      registeredDate: donor.registeredDate ? new Date(donor.registeredDate).toLocaleDateString() : 'N/A',
      userId: donor._id,
    }))

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donors-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Donors data exported as JSON')
  }

  // Get unique causes from donations for the filter dropdown
  const uniqueCauses = [
    ...new Map(
      donations
        .filter((d) => d.causeId?.name)
        .map((d) => [d.causeId._id, d.causeId])
    ).values(),
  ]

  const filteredDonations = donations.filter((d) => {
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus
    const matchesCause = filterCause === 'all' || d.causeId?._id === filterCause
    return matchesStatus && matchesCause
  })

  if (!userData || userData.role !== 'admin') {
    return <div>Access Denied</div>
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {userData.name}! Manage all system donations and causes.</p>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('donations')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'donations'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Donations
          </button>
          <button
            onClick={() => setActiveTab('causes')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'causes'
                ? 'border-b-4 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Manage Causes
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'users'
                ? 'border-b-4 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Manage Users
          </button>
        </div>

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <>
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

            {/* Filters and Refresh */}
            <div className="mb-6 flex gap-4">
              <select
                value={filterCause}
                onChange={(e) => setFilterCause(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
              >
                <option value="all">All Causes</option>
                {uniqueCauses.map((cause) => (
                  <option key={cause._id} value={cause._id}>
                    {cause.name.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
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
                        <th className="px-6 py-3 font-semibold text-gray-700">Cause</th>
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
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {donation.causeName
                              ? donation.causeName.replace(/_/g, ' ')
                              : 'Unknown Cause'}
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
          </>
        )}

        {/* Causes Management Tab */}
        {activeTab === 'causes' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">Available Causes ({causes.length})</h2>
              <button
                onClick={() => setShowCauseForm(!showCauseForm)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
              >
                {showCauseForm ? 'Cancel' : 'Add New Cause'}
              </button>
            </div>

            {/* Add Cause Form */}
            {showCauseForm && (
              <div className="bg-white p-8 rounded-lg shadow mb-8">
                <h3 className="text-xl font-semibold mb-6">Create New Cause</h3>
                <form onSubmit={handleCreateCause} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Cause Name
                    </label>
                    <input
                      type="text"
                      value={causeName}
                      onChange={(e) => setCauseName(e.target.value)}
                      placeholder="e.g., Medical Relief"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      disabled={creatingCause}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Cause Image (Optional)
                    </label>
                    <div className="space-y-3">
                      {causeImagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={causeImagePreview}
                            alt="Preview"
                            className="w-full max-w-xs h-40 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                          <div className="text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={creatingCause}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={causeDescription}
                      onChange={(e) => setCauseDescription(e.target.value)}
                      placeholder="Describe this cause..."
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      disabled={creatingCause}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creatingCause}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded"
                  >
                    {creatingCause ? 'Creating...' : 'Create Cause'}
                  </button>
                </form>
              </div>
            )}

            {/* Causes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {causes.map((cause) => (
                <div key={cause._id} className="relative">
                  <CauseCard 
                    cause={cause} 
                    isClickable={false}
                    isSelected={false}
                  />
                  <button
                    onClick={() => handleDeleteCause(cause._id)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
                    title="Delete this cause"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold">Manage Donors</h2>
                <div className="relative">
                  <button
                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4"
                      />
                    </svg>
                    Export User Data
                  </button>
                  {exportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 overflow-hidden">
                      <button
                        onClick={() => {
                          exportToCSV()
                          setExportMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-gray-800 font-medium"
                      >
                        📊 Export as CSV
                      </button>
                      <button
                        onClick={() => {
                          exportToJSON()
                          setExportMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-gray-800 font-medium border-t"
                      >
                        📄 Export as JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">Total Donor Registrations: </div>
                  <div className="text-4xl font-bold text-purple-600">{donors.length}</div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {donors.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No donors found</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Verification Status</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((donor) => (
                      <tr key={donor._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {donor.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {donor.email}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              donor.isAccountVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {donor.isAccountVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {donor.registeredDate ? new Date(donor.registeredDate).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard