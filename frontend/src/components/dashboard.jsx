import React from 'react'
import Map1 from './maps/Map1';
import Map2 from './maps/Map2';
import Map3 from './maps/Map3';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const handleWeatherMapClick = () => {
    navigate('/general-weather');
  };

  const [selectedMap, setSelectedMap] = React.useState(null);

  // Handler for button clicks
  const handleMapClick = (mapName) => {
      setSelectedMap(mapName);
  };

return (
    <div className='main h-full w-full bg-gray-100'>
        <div className='header bg-gray-200 h-full w-full gap-2 flex items-center justify-center pb-10 pt-5'>
            <h1 className='text-5xl font-bold'>Dashboard</h1>
            <div className='side right-0 top-0.5 bg-amber-100 absolute text-4xl p-2 m-3'>
                <button onClick={handleWeatherMapClick} className="hover:bg-amber-200">weather map</button>
            </div>
        </div>
        <>
            <div className='body bg-gray-200 h-full w-full gap-2 flex items-center justify-center'>
                <button
                    type="button"
                    className={`bg-blue-500 text-white p-2 rounded-md m-2 text-2xl hover:bg-blue-700`}
                    onClick={() => handleMapClick('Map1')}
                >
                    Map1
                </button>
                <button
                    type="button"
                    className={`bg-blue-500 text-white p-2 rounded-md m-2 text-2xl hover:bg-blue-700`}
                    onClick={() => handleMapClick('Map2')}
                >
                    Map2
                </button>
                <button
                    type="button"
                    className={`bg-blue-500 text-white p-2 rounded-md m-2 text-2xl hover:bg-blue-700`}
                    onClick={() => handleMapClick('Map3')}
                >
                    Map3
                </button>
            </div>
            <div className="flex justify-center items-center mt-8">
                {!selectedMap ? (
                    <div className="bg-yellow-300 text-yellow-900 px-6 py-4 rounded shadow text-2xl font-semibold">
                        click to load....
                    </div>
                ) : (
                    <div className="bg-yellow-300 text-yellow-900 px-6 py-4 rounded shadow text-2xl font-semibold">
                        {selectedMap === 'Map1' && <Map1 />}
                        {selectedMap === 'Map2' && <Map2 />}
                        {selectedMap === 'Map3' && <Map3 />}
                    </div>
                )}
            </div>
        </>
    </div>
)
}

export default Dashboard