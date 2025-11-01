import React from 'react'

const Header = () => {
return (
    <div className='bg-gray-900 h-20 w-screen flex justify-between items-center p-8'>
        <h1 className='text-3xl text-yellow-300 font-mono'>Disaster Management System</h1>
        <div>
        <button className='ml-4 px-4 py-2 bg-yellow-300 text-gray-950 rounded'>Login</button>
        <button className='ml-4 px-4 py-2 bg-yellow-300 text-gray-950 rounded'>Sign Up</button>
        </div>
    </div>
)
}

export default Header