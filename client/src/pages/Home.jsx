import React from "react"
import Navbar from "../components/Navbar.jsx"
import Header from "../components/Header.jsx"

function Home() {
  return (                                                          // The bg_img.png below is from public folder.
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/bg_img.jpg')] bg-cover bg-center">
      <Navbar/>
      <Header/>
    </div>
  )
}

export default Home
