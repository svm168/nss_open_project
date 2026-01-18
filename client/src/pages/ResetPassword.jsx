import React, { useContext, useRef, useState } from "react"
import { assets } from "../assets/assets"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import axios from "axios"
import { toast } from "react-toastify"
import Navbar from "../components/Navbar.jsx"

function ResetPassword() {

  const { backendURL } = useContext(AppContext)
  axios.defaults.withCredentials = true

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isEmailSent, setIsEmailSent] = useState('')
  const [otp, setOtp] = useState(0)
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false)
  
  const navigate = useNavigate()

  const inputRefs = useRef([])

  const handleInput = (event, index) => {
    if(event.target.value.length > 0 && index < inputRefs.current.length - 1){
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (event, index) => {
    if(event.key === 'Backspace' && event.target.value === '' && index > 0){
      inputRefs.current[index-1].focus()
    }
  }

  const handlePaste = (event) => {
    const paste = event.clipboardData.getData('text')
    const pasteArray = paste.split('')
    pasteArray.forEach((char, index) => {
      if(inputRefs.current[index]){
        inputRefs.current[index].value = char
      }
    });
  }

  const onSubmitEmail = async (event) => {
    event.preventDefault()
    try {
      const { data } = await axios.post(backendURL + '/api/auth/send-reset-otp', {email})
      if(data.success){
        toast.success(data.message)
        setIsEmailSent(true)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onSubmitOtp = async (event) => {    // OTP is not checked when otp is submitted.
    event.preventDefault()                  // OTP is checked when new password is submitted.
    const otpArray = inputRefs.current.map(event => event.value)
    setOtp(otpArray.join(''))
    setIsOtpSubmitted(true)
  }

  const onSubmitNewPassword = async (event) => {
    event.preventDefault()
    try {                                       // OTP is checked here.
      const { data } = await axios.post(backendURL + '/api/auth/reset-password', {email, otp, newPassword})
      if(data.success){
        toast.success(data.message)
        navigate('/login')
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div style={{ backgroundImage: `url(${assets.bg_img})` }} className="min-h-screen bg-cover bg-center">
    <Navbar/>
    <div className="flex items-center justify-center mt-30">
      
      {/* Enter email for reset password. */}
      {!isEmailSent &&
        <form onSubmit={onSubmitEmail} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-3xl font-semibold text-center mb-4">Reset Password</h1>
          <p className="text-center mb-6 text-indigo-300">Enter your registered e-mail address.</p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" className="w-3 h-3"/>
            <input type="email" placeholder="Email ID" className="bg-transparent outline-none text-indigo-300 w-full" value={email} onChange={event => setEmail(event.target.value)} required/>
          </div>

          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">Submit</button>
        </form>
      }

      {/* Enter OTP for reset Password. */}
      {!isOtpSubmitted && isEmailSent &&
        <form onSubmit={onSubmitOtp} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password otp</h1>
          <p className="text-center mb-6 text-indigo-300">Enter the 6-digit code sent to your e-mail ID.</p>
          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input type="text" maxLength='1' key={index} required
              className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
              ref={event => inputRefs.current[index] = event}
              onInput={event => handleInput(event, index)} onKeyDown={event => handleKeyDown(event, index)} />
            ))}
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">Submit</button>
        </form>
      }

      {/* Enter new Password. */}
      {isOtpSubmitted && isEmailSent &&
        <form onSubmit={onSubmitNewPassword} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">New Password</h1>
          <p className="text-center mb-6 text-indigo-300">Enter the new password below.</p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" className="w-3 h-3"/>
            <input type="password" placeholder="New Password" className="bg-transparent outline-none text-indigo-300" value={newPassword} onChange={event => setNewPassword(event.target.value)} required/>
          </div>

          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">Submit</button>
        </form>
      }
      
    </div>
    </div>
  )
}

export default ResetPassword