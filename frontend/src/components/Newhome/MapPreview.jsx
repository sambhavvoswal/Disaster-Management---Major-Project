import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchWeatherDataByLocation, extractWeatherMetrics } from './LocationCollector';
import DataCard from '../General/DataCard';

// Fix for default icon issues with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapPreview = () => {
  const [position, setPosition] = useState([20.5937, 78.9629]); // Default to India
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherMetrics, setWeatherMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const markerRef = useRef(null);

  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setShowPermissionPopup(true);
  };

  const handleAllowLocation = () => {
    setShowPermissionPopup(false);
    setLocationPermissionAsked(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to access your location. Please enable location services.');
      }
    );
  };

  const handleDenyLocation = () => {
    setShowPermissionPopup(false);
    setLocationPermissionAsked(true);
    setError('Location access denied. Using default location.');
  };

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeatherDataByLocation(lat, lon);
      setWeatherData(data);
      const metrics = extractWeatherMetrics(data);
      setWeatherMetrics(metrics);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
      setWeatherMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const MapClickEvent = () => {
    useMapEvents({
      click: (e) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
        fetchWeather(e.latlng.lat, e.latlng.lng);
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
        fetchWeather(newPosition.lat, newPosition.lng);
      }
    },
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Location Permission Popup */}
      {showPermissionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Location Access Required</h2>
            <p className="text-gray-600 mb-6">
              We need access to your location to provide accurate weather information for your area.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDenyLocation}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
              >
                Deny
              </button>
              <button
                onClick={handleAllowLocation}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900 text-white p-4 z-10 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-800 p-2 rounded-md">
            Latitude: {latitude ? latitude.toFixed(4) : 'N/A'}
          </div>
          <div className="bg-gray-800 p-2 rounded-md">
            Longitude: {longitude ? longitude.toFixed(4) : 'N/A'}
          </div>
        </div>
        {loading && (
          <div className="text-blue-400 font-semibold">Loading weather data...</div>
        )}
      </div>

      {/* Map Container */}
      <MapContainer center={position} zoom={13} className="h-full w-full z-0">
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
            ref={markerRef}
          >
            <Popup>Click to select or drag me to a new location</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Weather Data Display */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-20 max-h-64 overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded-lg">
            {error}
          </div>
        )}

        {weatherMetrics.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3">Weather Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {weatherMetrics.map((metric, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">{metric.title}</h4>
                  <p className="text-lg font-bold text-white">{metric.value}</p>
                  <p className="text-xs text-gray-400">{metric.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!weatherMetrics.length && !error && !loading && (
          <p className="text-gray-400 text-center">Click on the map or drag the marker to get weather data</p>
        )}
      </div>
    </div>
  );
};

export default MapPreview;