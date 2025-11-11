import React from 'react'

const SideBar = () => {
  const menuItems = [
    { key: 'air', label: 'Air Quality' },
    { key: 'weather', label: 'Weather' },
    { key: 'alerts', label: 'Disaster Alerts' },
    { key: 'location', label: 'Location' },
    { key: 'settings', label: 'Settings' },
    { key: 'help', label: 'Help' },
  ]

  const buttonClass =
    'w-full text-left rounded-md px-4 py-3 text-sm md:text-base lg:text-lg font-medium ' +
    'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 transition-colors'

  return (
    <aside className='h-full p-3 sm:p-4'>
      <nav className='flex flex-col gap-2'>
        {menuItems.map(item => (
          <button
            key={item.key}
            type='button'
            className={buttonClass}
            aria-label={item.label}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default SideBar