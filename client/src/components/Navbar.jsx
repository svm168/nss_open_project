import React, { useContext } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

function Navbar() {

    const navigate = useNavigate()
    const location = useLocation()
    const { userData, backendURL, setUserData, setIsLoggedIn } = useContext(AppContext)

    const sendVerificationOTP = async () => {
        try {
            axios.defaults.withCredentials = true

            const { data } = await axios.post(backendURL + '/api/auth/send-verify-otp')

            if(data.success){
                navigate('/email-verify')
                toast.success(data.message)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true

            const { data } = await axios.post(backendURL + '/api/auth/logout')
            data.success && setIsLoggedIn(false)
            data.success && setUserData(false)

            navigate('/')
            toast.success(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    return(
        <div className="flex flex-col absolute top-0 w-full">
        <div className="bg-blue-600 w-full flex justify-between">
            <div>Phone: +91-1234567890</div>
        </div>
        <div className="w-full flex justify-between items-center sm:px-24 bg-blue-400">
            <div className="flex flex-row">
                <img src={assets.logo} alt="" className="w-12 sm:w-22"/>
                <div className="self-center pl-4 text-2xl">DONATION TRACKING SYSTEM</div>
            </div>

            {userData ? 
                <div className="w-11 h-11 flex justify-center items-center rounded-full bg-slate-700 text-white relative group text-xl">
                    {userData.name[0].toUpperCase()}
                    <div className="absolute hidden group-hover:block top-0 mt-1 right-0 z-10 text-white pt-10">
                        <ul className="list-none m-0 p-2 bg-black text-sm rounded-lg">
                            <li onClick={() => navigate('/profile')} className="py-1 px-2 hover:bg-gray-700 cursor-pointer rounded-t-lg">Profile</li>
                            <li onClick={logout} className="py-1 px-2 hover:bg-gray-700 cursor-pointer pr-10 rounded-b-lg">Logout</li>
                        </ul>
                    </div>
                </div>
            :
                <button onClick={() => navigate(location.pathname === '/' ? '/login' : '/')}
                    className="flex items-center gap-2 border border-white rounded-full px-6 py-2 text-white hover:bg-blue-500 hover:scale-105 transition-all duration-300 cursor-pointer">{location.pathname === '/' ? 'Login' : 'Home'}
                    <img src={assets.arrow_icon} alt="" />
                </button>
            }
        </div>
        </div>
    )
}

export default Navbar