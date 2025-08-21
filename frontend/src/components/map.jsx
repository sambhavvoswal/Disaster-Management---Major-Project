import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchWeatherData } from './open_weather_API';
import Cell from './Cell';

// Fix for default icon issues with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Map = () => {
  const [position, setPosition] = useState([20.5937, 78.9629]); // Default to India
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const markerRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }, []);

  const MapClickEvent = () => {
    useMapEvents({
      click: (e) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
        setIsSidebarOpen(false); // Close sidebar on map click
      },
    });
    return null;
  };

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPosition = marker.getLatLng();
        setPosition([newPosition.lat, newPosition.lng]);
        setLatitude(newPosition.lat);
        setLongitude(newPosition.lng);
        setIsSidebarOpen(false); // Close sidebar on marker drag
      }
    },
  };

  const handleSendLocation = async () => {
    if (latitude && longitude) {
      const data = await fetchWeatherData(latitude, longitude);
      setWeatherData(data);
      setIsSidebarOpen(true); // Open sidebar when data is sent
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bg-gray-900 text-white p-4 z-10 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-800 p-2 rounded-md">
            Latitude: {latitude ? latitude.toFixed(4) : 'N/A'}
          </div>
          <div className="bg-gray-800 p-2 rounded-md">
            Longitude: {longitude ? longitude.toFixed(4) : 'N/A'}
          </div>
        </div>
        <button
          onClick={handleSendLocation}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          ANALYZE DATA
        </button>
      </div>

      <MapContainer center={position} zoom={13} className="h-full w-full z-0" >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickEvent />
        {latitude && longitude && (
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[latitude, longitude]}
            ref={markerRef}>
            <Popup>
              Drag me to select a new location!
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div
        className={`absolute top-0 right-0 h-full bg-gray-800 text-white shadow-lg transition-all duration-300 z-50 ${isSidebarOpen ? 'w-96' : 'w-0'} ${isSidebarExpanded ? '' : 'collapsed'}`}
        style={{ overflowX: 'hidden' }}
      >
        {isSidebarOpen && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Air Quality Metrics</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {weatherData && (
              <div className="space-y-3">
                <Cell title="Location" dataValue={weatherData.name} />
                <Cell title="Temperature" dataValue={`${(weatherData.main.temp - 273.15).toFixed(2)} °C`} />
                <Cell title="Description" dataValue={weatherData.weather[0].description} />
                <Cell title="Humidity" dataValue={`${weatherData.main.humidity}%`} />
                <Cell title="Wind Speed" dataValue={`${weatherData.wind.speed} m/s`} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
