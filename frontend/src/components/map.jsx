import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchWeatherData } from './open_weather_API';

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
      }
    },
  };

  const handleSendLocation = async () => {
    if (latitude && longitude) {
      const data = await fetchWeatherData(latitude, longitude);
      setWeatherData(data);
      console.log('Weather Data:', data);
    }
  };

  return (
    <div className="p-4">
      <div className="bg-gray-100 p-4 mb-4 rounded-md border border-gray-300">
        <h2 className="text-xl font-bold mb-2">Current Location:</h2>
        {latitude && longitude ? (
          <p className="text-lg">Latitude: {latitude.toFixed(4)}, Longitude: {longitude.toFixed(4)}</p>
        ) : (
          <p className="text-lg">Fetching location...</p>
        )}
      </div>

      <MapContainer center={position} zoom={13} className="h-[500px] w-full rounded-md shadow-md">
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
      <button
        onClick={handleSendLocation}
        className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
      >
        Send Location Data
      </button>

      {weatherData && (
        <div className="mt-4 bg-blue-100 p-4 rounded-md border border-blue-300">
          <h2 className="text-xl font-bold mb-2">Weather Information:</h2>
          <p className="text-lg">Location: {weatherData.name}</p>
          <p className="text-lg">Temperature: {(weatherData.main.temp - 273.15).toFixed(2)} °C</p>
          <p className="text-lg">Description: {weatherData.weather[0].description}</p>
          <p className="text-lg">Humidity: {weatherData.main.humidity}%</p>
          <p className="text-lg">Wind Speed: {weatherData.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
};

export default Map;
