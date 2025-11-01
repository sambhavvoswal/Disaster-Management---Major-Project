import React from 'react'
import Header from './Home/Header'
import Map from './map'
import SideBar from './Home/SideBar'

const Home = () => {
return (
    <div className='bg-gray-950 h-screen w-screen flex gap-2'>
        {/* <div className='text-8xl text-yellow-300 '>This is home</div> */}
        {/* <Header /> */}
        <div className='left-0 w-[70vw]'>
            <Map />
        </div>
        <div className='flex-auto h-full bg-amber-300 relative'>
            <SideBar />
        </div>
    </div>
)
}

export default Home