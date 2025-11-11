import React from 'react'
import newsData from './news.json'

const SlidingNews = () => {
const MARQUEE_SPEED = 25 // Adjust this value to change speed (higher = faster)
const [newsItems, setNewsItems] = React.useState([])

React.useEffect(() => {
	setNewsItems(
		Array.isArray(newsData?.results)
			? newsData.results.filter(item => item?.title && item?.link)
			: []
	)
}, [])

const marqueeContent = newsItems.length > 0
	? newsItems.map((item, index) => (
		`${item.title} `
	)).join(' — ')
	: 'Severe weather alert: Heavy rains and strong winds expected in the coastal regions. Residents are advised to stay indoors and take necessary precautions. Emergency services are on high alert to respond to any incidents.'

return (
    <div className='h-[4vh] bg-white flex top-[8vh] z-50'>
        <div className='left-0 bg-red-900 h-full p-4 flex items-center'>
            <p className='text-white font-semibold'>Headlines:</p>
        </div>
        <div className='w-full h-full flex items-center overflow-hidden'>
            <marquee scrollAmount={MARQUEE_SPEED} className='text-black font-semibold whitespace-nowrap'>
                {newsItems.length > 0 ? (
                    <>
                        {newsItems.map((item, index) => (
                            <span key={index} className='inline-flex items-center gap-2 mx-4'>
                                <span>{item.title}</span>
                                <a
                                    href={item.link}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='bg-red-600 text-black font-bold px-2 py-0.5 text-xs hover:bg-red-700 transition'
                                >
                                    Know More
                                </a>
                                <span className='text-gray-400'>—</span>
                            </span>
                        ))}
                    </>
                ) : (
                    <span>No news available</span>
                )}
            </marquee>
        </div>
    </div>
)
}

export default SlidingNews