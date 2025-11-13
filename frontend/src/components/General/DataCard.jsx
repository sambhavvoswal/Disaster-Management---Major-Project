import React from 'react'
import CountUp from '../General/CountUp'
const DataCard = ({ title = 'DataCard', value = 100, status = 'Good' }) => {
  return (
    <div className='w-full h-full'>
        <div className='w-fit h-full p-2 m-2 rounded-md border-2 border-gray-100 bg-gray-200'>
            <h1 className='text-xl font-bold'>{title}</h1>
            <div className='relative text-2xl right-0 pb-3 '>
            <CountUp
                from={0}
                to={value}
                separator=","
                direction="up"
                duration={1}
                className="count-up-text absolute right-0"
            />
            </div>
            <p className='text-sm text-gray-500'>{status}</p>
        </div>
    </div>
  )
}

export default DataCard