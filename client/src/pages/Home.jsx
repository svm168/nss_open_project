import React from "react"
import Navbar from "../components/Navbar.jsx"
import Header from "../components/Header.jsx"
import { assets } from "../assets/assets"

function Home() {
  return (
    <div style={{ backgroundImage: `url(${assets.bg_img})` }} className="min-h-screen bg-cover bg-center">
      <Navbar/>
      <div className="flex flex-col items-center justify-center">
        <Header/>
      </div>
    </div>
  )
}

export default Home
