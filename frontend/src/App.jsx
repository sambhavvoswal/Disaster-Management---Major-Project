import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Map from './components/map'
import Dashboard from './components/dashboard'
import GeneralWeather from './components/GeneralWeather'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <h1>Initial set-up 👍</h1> */}
      {/* <Map /> */}
      {/* {<Dashboard />} */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/general-weather" element={<GeneralWeather />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
