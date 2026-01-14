import React, { useContext, useEffect, useState } from "react"
import { assets } from "../assets/assets"
import { useNavigate } from 'react-router-dom'
import { AppContext } from "../context/AppContext"
import axios from 'axios'
import { toast } from "react-toastify"
import Navbar from "../components/Navbar.jsx"

function Login() {

  const navigate = useNavigate()

  const { backendURL, isLoggedIn, setIsLoggedIn, getUserData, userData } = useContext( AppContext )
  
  const [state, setState] = useState('Login')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('donor')
  const [isOpen, setIsOpen] = useState(false)

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault()

      axios.defaults.withCredentials = true

      if(state === 'Sign Up'){
        const { data } = await axios.post(`${backendURL}/api/auth/register`, {name, email, password, role})

        if(data.success){
          setIsLoggedIn(true)
          navigate('/email-verify')
        }
        else{
          toast.error(data.message)
        }
      }
      else{
        const { data } = await axios.post(`${backendURL}/api/auth/login`, {email, password, role})

        if(data.success){
          setIsLoggedIn(true)
          const user = await getUserData()
          if (user) {
            if (!user.isAccountVerified) {
              navigate('/email-verify')
            } else {
              if (user.role === 'donor') navigate('/donor-dashboard')
              else if (user.role === 'admin') navigate('/admin-dashboard')
              else navigate('/')
            }
          }
        }
        else{
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // const byPassHandler = async () => {
  //   try {      
  //     axios.defaults.withCredentials = true

  //     const { data } = await axios.post(`${backendURL}/api/auth/bypass`)

  //     if(data.success){
  //       setIsLoggedIn(true)
  //       getUserData()
  //       navigate('/')
  //       toast.success('Logged in as Recruiter!')
  //     }
  //     else{
  //       toast.error(data.message)
  //     }
  //   } catch (error) {
  //     toast.error(error.message)
  //   }
  // }

  useEffect(() => {
    if (isLoggedIn && userData) {
      if (!userData.isAccountVerified) {
        navigate('/email-verify')
      } else {
        if (userData.role === 'donor') navigate('/donor-dashboard')
        else if (userData.role === 'admin') navigate('/admin-dashboard')
        else navigate('/')
      }
    }
  }, [isLoggedIn, userData])

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0">
      <Navbar/>
      {/* <img src={assets.logo} alt="" className="absolute left-5 sm:left-20 top-5 w-32 sm:w-42 cursor-pointer"
      onClick={() => navigate('/')}/> */}
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === 'Sign Up' ? 'Create Account' : 'Login'}</h2>
        <p className="text-center text-md mb-6">
          {state === 'Sign Up' ? 'Create new account' : 'Login to your account!'}</p>

        <form onSubmit={onSubmitHandler}>

          {state === 'Sign Up' && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input type="text" placeholder="Full Name" required className="bg-transparent outline-none w-full"
              onChange={event => setName(event.target.value)} value={name}/>
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input type="email" placeholder="E-mail ID" required className="bg-transparent outline-none w-full"
            onChange={event => setEmail(event.target.value)} value={email}/>
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input type="password" placeholder="Password" required className="bg-transparent outline-none w-full"
            onChange={event => setPassword(event.target.value)} value={password}/>
          </div>

          {state === 'Login' && (<p className="mb-4 text-indigo-500 cursor-pointer" onClick={() => navigate('/reset-password')}>Forgot Password?</p>)}
          
          <div className="mb-4 relative">
            <div className="flex items-center justify-between w-full px-5 py-2.5 rounded-full bg-[#333A5C] cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
              <span className="flex items-center w-full">
                <span className="flex-1">Login as:</span>
                <div className="flex-1 text-center font-bold">{role}</div>
                <span className="flex-1"></span> {/* Empty spacer to balance the left side */}
              </span>
              <img src={assets.arrow_icon} alt="" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
              <div className="absolute top-full left-0 w-full bg-[#333A5C] rounded-lg mt-1 z-10">
                <div className="px-5 py-2 cursor-pointer hover:bg-gray-600 rounded-t-lg" onClick={() => { setRole('donor'); setIsOpen(false); }}>Donor</div>
                <div className="px-5 py-2 cursor-pointer hover:bg-gray-600 rounded-b-lg" onClick={() => { setRole('admin'); setIsOpen(false); }}>Admin</div>
              </div>
            )}
          </div>

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer">{state}</button>

        </form>

        {state === 'Sign Up' ? (
          <p
            className="whitespace-pre text-gray-400 text-center text-xs mt-4">Already have an account?{'    '}
            <span onClick={() => setState('Login')} className="text-blue-400 cursor-pointer underline">Login Here</span>
          </p>
        ) : (
          <p
            className="whitespace-pre text-gray-400 text-center text-xs mt-4">Don't have an account?{'    '}
            <span onClick={() => setState('Sign Up')} className="text-blue-400 cursor-pointer underline">Sign Up</span>
          </p>
        ) }

        {/* <p
          className="whitespace-pre text-white text-center text-xs mt-4">Want to explore rest of the Port Folio without logging in?{'    '}
          <span onClick={() => byPassHandler()} className="text-blue-400 cursor-pointer underline">Click Here</span>
        </p> */}

      </div>
    </div>
  )
}

export default Login