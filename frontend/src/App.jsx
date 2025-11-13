import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Map from './components/map'
import Dashboard from './components/dashboard'
import GeneralWeather from './components/GeneralWeather'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Header from './components/Home/Header'
import Footer from './components/Home/Footer'
import Interface from './components/Newhome/Interface'
import Dock from './components/General/Dock'
import { HomeIcon, Squares2X2Icon, SunIcon } from '@heroicons/react/24/outline'
import Login from './components/General/Login'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Home" element={<Interface />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/general-weather" element={<GeneralWeather />} />
        </Routes>
      </BrowserRouter>
      <Footer />
      <Dock 
        items={[
          {
            icon: <HomeIcon size={18} />,
            label: 'Home',
            onClick: () => (window.location.href = '/')
          },
          {
            icon: <Squares2X2Icon size={18} />,
            label: 'Dashboard',
            onClick: () => (window.location.href = '/dashboard')
          },
          {
            icon: <SunIcon size={18} />,
            label: 'General Weather',
            onClick: () => (window.location.href = '/general-weather')
          },
        ]}
        panelHeight={65}
        baseItemSize={40}
        magnification={60}
      />
    </>
  )
}

export default App
