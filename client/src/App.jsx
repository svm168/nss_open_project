import React, { useContext, useEffect } from "react"
import { Route, Routes, useNavigate, useLocation } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import VerifyEmail from "./pages/VerifyEmail.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"
import Profile from "./pages/Profile.jsx"
import DonorDashboard from "./pages/DonorDashboard.jsx"
import DonationPayment from "./pages/DonationPayment.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import PaymentConfirmation from "./pages/PaymentConfirmation.jsx"
import AdminApproval from "./pages/AdminApproval.jsx"
import WaitingForApproval from "./pages/WaitingForApproval.jsx"
import { ToastContainer } from 'react-toastify'
import { AppContext } from './context/AppContext'

function AppContent() {
  const { isLoggedIn, userData } = useContext(AppContext)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoggedIn) return

    if (userData && !userData.isAccountVerified && location.pathname !== '/email-verify') {
      navigate('/email-verify')
      return
    }

    // If admin but not approved, redirect to waiting page (unless on admin-approval page)
    if (userData && userData.role === 'admin' && location.pathname !== '/admin-approval') {
      if (userData.adminApprovalStatus !== 'approved') {
        if (location.pathname !== '/waiting-for-approval') {
          navigate('/waiting-for-approval')
        }
      }
    }
  }, [isLoggedIn, userData, location.pathname, navigate])

  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/email-verify" element={<VerifyEmail/>}/>
      <Route path="/reset-password" element={<ResetPassword/>}/>
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/donor-dashboard" element={<DonorDashboard/>}/>
      <Route path="/donation-payment" element={<DonationPayment/>}/>
      <Route path="/payment-confirmation/:donationId" element={<PaymentConfirmation/>}/>
      <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
      <Route path="/admin-approval" element={<AdminApproval/>}/>
      <Route path="/waiting-for-approval" element={<WaitingForApproval/>}/>
    </Routes>
  )
}

function App() {
  return (
    <div>
      <ToastContainer/>
      <AppContent/>
    </div>
  )
}

export default App
