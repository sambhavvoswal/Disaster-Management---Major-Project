import React from 'react'

const Header = () => {
return (
    <div className='bg-gray-900 w-full flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex-wrap gap-4'>
        <h1 className='text-lg sm:text-2xl md:text-3xl lg:text-4xl text-yellow-300 font-mono whitespace-nowrap'>
            Disaster Management System
        </h1>
        {/* <div className='flex gap-2 sm:gap-3 md:gap-4 flex-wrap'>
            <button className='px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-yellow-300 text-gray-950 rounded font-semibold hover:bg-yellow-400 transition-colors'>
                Login
            </button>
            <button className='px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-yellow-300 text-gray-950 rounded font-semibold hover:bg-yellow-400 transition-colors'>
                Sign Up
            </button>
        </div> */}
        <nav className='bg-gray-800 w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 flex justify-between items-center'>
            <div className='flex gap-4'>
                <button className='px-3 sm:px-4 py-1.5 sm:py-1.75 text-sm sm:text-base bg-gray-800 text-gray-300 rounded font-semibold hover:bg-gray-700 transition-colors'>
                    <a href='/' className='text-white'>
                        Home
                    </a>
                </button>
                {/* <button className='px-3 sm:px-4 py-1.5 sm:py-1.75 text-sm sm:text-base bg-gray-800 text-gray-300 rounded font-semibold hover:bg-gray-700 transition-colors'>
                    <a href='/dashboard' className='text-white'>
                        Dashboard
                    </a>
                </button> */}
                <button className='px-3 sm:px-4 py-1.5 sm:py-1.75 text-sm sm:text-base bg-gray-800 text-gray-300 rounded font-semibold hover:bg-gray-700 transition-colors'>
                    <a href='/air-quality' className='text-white'>
                        Air Quality 
                    </a>
                </button>
                <button className='px-3 sm:px-4 py-1.5 sm:py-1.75 text-sm sm:text-base bg-gray-800 text-gray-300 rounded font-semibold hover:bg-gray-700 transition-colors'>
                    <a href='/event-handler' className='text-white'>
                        Event Handler
                    </a>
                </button>
                <button className='px-3 sm:px-4 py-1.5 sm:py-1.75 text-sm sm:text-base bg-gray-800 text-gray-300 rounded font-semibold hover:bg-gray-700 transition-colors'>
                    <a href='/map-preview' className='text-white'>
                        General Weather
                    </a>
                </button>
            </div>
        </nav>
    </div>
    
)
}

export default Header