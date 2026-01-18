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
        <div className="flex flex-col sticky top-0 w-full z-100">
        <div className="bg-blue-600 w-full flex gap-x-8">
            <div className="ml-6">Phone: +91-8299692198</div>
            <div>E-mail: shivam_kj@ece.iitr.ac.in</div>
        </div>
        <div className="w-full flex justify-between items-center sm:px-24 bg-gray-800">
            <div className="flex flex-row">
                <img src={assets.logo} alt="" className="w-12 sm:w-22 bg-white/80 rounded-full my-2"/>
                <div className="self-center pl-8 text-4xl text-white">DONATION MANAGEMENT SYSTEM</div>
            </div>

            {userData ? 
                <div className="w-11 h-11 flex justify-center items-center rounded-full text-black font-bold bg-blue-500 relative group text-xl">
                    {userData.name[0].toUpperCase()}
                    <div className="absolute hidden group-hover:block top-0 mt-1 right-0 z-10 text-white pt-10">
                        <ul className="list-none m-0 p-2 bg-black text-sm rounded-lg">
                            <li onClick={() => navigate('/profile')} className="py-1 px-2 hover:bg-gray-700 cursor-pointer rounded-t-lg font-medium">Profile</li>
                            <li onClick={logout} className="py-1 px-2 hover:bg-gray-700 cursor-pointer pr-10 rounded-b-lg font-medium">Logout</li>
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