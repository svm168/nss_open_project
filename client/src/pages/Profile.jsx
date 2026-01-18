import React, { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { assets } from "../assets/assets"
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
    <div style={{ backgroundImage: `url(${assets.bg_img})` }} className="min-h-screen bg-cover bg-center flex flex-col">
    <Navbar />
    <div className="flex items-center justify-center mt-20">
      <div className="text-black bg-white/30 backdrop-blur-sm border border-white/20 px-10 shadow-xl p-8 rounded-4xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Profile</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-bold">Name:</label>
          <p className="text-gray-900 ml-4">{userData.name}</p>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-bold">Email:</label>
          <p className="text-gray-900 ml-4">{userData.email}</p>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-bold">Role:</label>
          <p className="text-gray-900 ml-4">{userData.role}</p>
        </div>
        <button
          onClick={() => navigate('/reset-password')}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline cursor-pointer"
        >
          Change Password
        </button>
      </div>
    </div>
    </div>
  )
}

export default Profile