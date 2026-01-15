import React, { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import Navbar from "../components/Navbar.jsx"

function Profile() {
  const { userData } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!userData) {
      navigate('/login')
    }
  }, [userData, navigate])

  if (!userData) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Navbar />
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mt-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Profile</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
          <p className="text-gray-900">{userData.name}</p>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <p className="text-gray-900">{userData.email}</p>
        </div>
        <button
          onClick={() => navigate('/reset-password')}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Change Password
        </button>
      </div>
    </div>
  )
}

export default Profile