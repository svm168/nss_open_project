import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

function Header(){

    const navigate = useNavigate()
    const { userData } = useContext(AppContext)

    const onClickHandler = () => {
        if (userData) {
            if (userData.role === 'donor') navigate('/donor-dashboard')
            else if (userData.role === 'admin') navigate('/admin-dashboard')
            else navigate('/')
        } else {
            navigate('/login')
        }
    }

    return(
        <div className="flex flex-col items-center mt-24 px-4 text-center text-black">
            {/* <img src={assets.header_img} alt="" className="w-36 h-36 rounded-full"/>
            
            <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">Hey {userData ? userData.name : 'Fellow Developer'}!
                <img className="w-8 aspect-square" src={assets.hand_wave} alt="" />
            </h1> */}
            
            <h2 className="text-3xl sm:text-5xl font-semibold mb-4">BE THE CHANGE <br /> YOU WANT TO SEE IN THE WORLD!</h2>

            <p className="mb-8 max-w-md text-xl">Alone we can do so little,<br></br> Together we can do so much.</p>
            
            <button onClick={() => onClickHandler()} className="flex items-center gap-2 border-2 border-black rounded-full px-10 py-2 text-black text-2xl hover:bg-blue-500 hover:scale-105 transition-all duration-300 cursor-pointer">DONATE</button>
        </div>
    )
}

export default Header