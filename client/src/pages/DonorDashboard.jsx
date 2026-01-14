import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'

const DonorDashboard = () => {
  const { userData } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (userData && !userData.isAccountVerified) {
      navigate('/email-verify')
    }
  }, [userData, navigate])

  if (!userData || userData.role !== 'donor') {
    return <div>Access Denied</div>
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-4">Donor Dashboard</h1>
        <p>Welcome, {userData.name}! This is the donor dashboard where you can manage your donations.</p>
        {/* Sample content */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Your Donations</h2>
          <p>Here you can view and manage your donation history.</p>
        </div>
      </div>
    </div>
  )
}

export default DonorDashboard