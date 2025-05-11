import React from 'react'
import { useNavigate } from 'react-router-dom'
const HomeBtn = () => {
  const navigate = useNavigate()
  return (
    <button
      className="ml-2 text-green-500 bg-black border-green-500 border-2 hover:bg-green-500 hover:text-black text-lg flex justify-center py-2.5 px-5 rounded-md font-bold hover:cursor-pointer"
      onClick={() => navigate('/')}
    >
      Home
    </button>
  )
}


const LogoutBtn = ({ onLogoutClick }) => {
  return(
  <button
    className="ml-2 text-red-500 bg-black border-red-500 border-2 hover:bg-red-500 hover:text-black text-lg flex justify-center py-2.5 px-5 rounded-md font-bold hover:cursor-pointer"
    onClick={onLogoutClick}
  >
    Logout
  </button>
  )
}

export {HomeBtn, LogoutBtn}