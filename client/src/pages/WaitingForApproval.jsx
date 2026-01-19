import React, { useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppContext } from '../context/AppContext'

export default function WaitingForApproval() {
  const navigate = useNavigate()
  const { backendURL, getUserData, setIsLoggedIn, setUserData } = useContext(AppContext)

  useEffect(() => {
    // Prevent navigation away from this page
    const handlePopState = (e) => {
      e.preventDefault()
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Poll for approval status every 5 seconds
  useEffect(() => {
    let isApproved = false
    
    const checkApprovalStatus = async () => {
      if (isApproved) return // Stop polling if already approved
      
      try {
        const response = await axios.get(`${backendURL}/api/user/data`, {
          withCredentials: true
        })
        
        const approvalStatus = response.data.userData?.adminApprovalStatus
        console.log('Current adminApprovalStatus:', approvalStatus)
        
        if (approvalStatus === 'approved') {
          console.log('✓ Approval detected! Redirecting to admin dashboard...')
          isApproved = true
          
          // Admin has been approved - refresh user data and redirect
          await getUserData()
          navigate('/admin-dashboard')
        }
      } catch (error) {
        console.error('Error checking approval:', error.message)
      }
    }

    // Run once immediately
    checkApprovalStatus()
    
    const interval = setInterval(checkApprovalStatus, 5000)
    return () => clearInterval(interval)
  }, [backendURL, navigate, getUserData])

  const handleLogout = async () => {
    try {
      await axios.post(`${backendURL}/api/auth/logout`, {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setIsLoggedIn(false)
      setUserData(false)
      navigate('/')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 p-5 font-sans">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        @keyframes bounce-dots {
          0%, 80%, 100% {
            opacity: 0.4;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-15px);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.6s ease-out;
        }
        .animate-pulse-custom {
          animation: pulse 2s infinite;
        }
        .dot {
          animation: bounce-dots 1.4s infinite ease-in-out;
        }
        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
      `}</style>

      <button onClick={handleLogout}
        className="absolute top-6 right-6 bg-white/95 hover:bg-white text-gray-800 font-semibold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer"
      >Logout</button>

      <div className="bg-white rounded-2xl p-6 md:px-20 shadow-3xl max-w-2xl w-full text-center animate-slideIn">
        <div className="text-7xl md:text-8xl mb-8 animate-pulse-custom">⏳</div>

        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-8 leading-tight">
          Waiting for SuperAdmin Approval
        </h1>

        <div className="bg-gray-50 border-l-4 border-indigo-500 rounded-lg p-6 md:p-8 mb-8 text-left">
          <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6">
            Your admin account has been created successfully, but your access is pending approval from the SuperAdmin.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
              <span className="font-bold text-gray-800 text-xs md:text-sm uppercase tracking-wide">
                Status:
              </span>
              <span className="col-span-2 text-amber-600 font-semibold text-xs md:text-sm px-3 py-2 bg-amber-50 rounded inline-block">
                Pending Approval
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
              <span className="font-bold text-gray-800 text-xs md:text-sm uppercase tracking-wide">
                What happens next?
              </span>
              <span className="col-span-2 text-gray-600 text-xs md:text-sm leading-relaxed">
                The SuperAdmin will review your request and send you an email with their decision.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
              <span className="font-bold text-gray-800 text-xs md:text-sm uppercase tracking-wide">
                Timeline:
              </span>
              <span className="col-span-2 text-gray-600 text-xs md:text-sm">
                Usually within 24-48 hours
              </span>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center gap-3 mt-8 h-5">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full dot"></div>
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full dot"></div>
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full dot"></div>
        </div>

        <p className="text-gray-500 text-xs md:text-sm italic leading-relaxed">
          You will receive an email notification once the SuperAdmin approves or denies your request.
        </p>
      </div>
    </div>
  )
}