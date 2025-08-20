import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Map from './components/map'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <h1>Initial set-up 👍</h1> */}
      <Map />
    </>
  )
}

export default App
