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

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Interface />} />
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/general-weather" element={<GeneralWeather />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  )
}

export default App
