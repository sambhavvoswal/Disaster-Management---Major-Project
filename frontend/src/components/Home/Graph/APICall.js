import React, { useState, useEffect } from 'react';
import WeatherChart from './WeatherChart';
import { transformWeatherData } from './DataTransformer';

// Default location (Hyderabad, India)
const DEFAULT_LATITUDE = 16.1725;
const DEFAULT_LONGITUDE = 75.6557;

function App() {
    const [weatherData, setWeatherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationDenied, setLocationDenied] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isUsingDefault, setIsUsingDefault] = useState(false);
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

    useEffect(() => {
        // Request user's geolocation with timeout
        if (navigator.geolocation) {
            const timeoutId = setTimeout(() => {
                // If no response after 5 seconds, use default location
                if (!locationPermissionGranted && !locationDenied) {
                    console.log('Location request timeout, using default location');
                    setIsUsingDefault(true);
                    fetchWeatherData(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
                }
            }, 5000);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success: location granted
                    clearTimeout(timeoutId);
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setLatitude(lat);
                    setLongitude(lon);
                    setLocationDenied(false);
                    setIsUsingDefault(false);
                    setLocationPermissionGranted(true);
                    fetchWeatherData(lat, lon);
                },
                (error) => {
                    // Error: location denied or unavailable
                    clearTimeout(timeoutId);
                    console.error('Geolocation error:', error);
                    setLocationDenied(true);
                    setIsUsingDefault(true);
                    // Use default location as fallback
                    fetchWeatherData(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
            setIsUsingDefault(true);
            fetchWeatherData(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
        }
    }, []);

    const fetchWeatherData = async (lat, lon) => {
        try {
            const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,rain&current=is_day`;
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rawData = await response.json();
            const processedData = transformWeatherData(rawData);
            setWeatherData(processedData);
            setLocationDenied(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Red alert banner when location is denied
    if (locationDenied && !isUsingDefault) {
        return (
            <div className="App" style={{ backgroundColor: '#1e1e1e', minHeight: '100vh', padding: '20px' }}>
                <div style={{
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '20px',
                    fontWeight: 'bold',
                    fontSize: '16px'
                }}>
                    ⚠️ Location access denied. Please enable location permissions in your system settings to view weather data.
                </div>
                <h1 style={{ color: '#ccc', textAlign: 'center' }}>Weather Forecast</h1>
                <p style={{ color: '#999', textAlign: 'center' }}>Waiting for location access...</p>
            </div>
        );
    }

    if (error) return <div style={{color: 'red', textAlign: 'center', padding: '20px'}}>Error: {error}</div>;

    return (
        <div className="App" style={{ backgroundColor: '#1e1e1e', minHeight: '100vh', position: 'relative' }}>
            {/* Sidebar Notification - Always visible */}
            <div style={{
                position: 'fixed',
                left: '20px',
                top: '20px',
                width: '300px',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                zIndex: 1000,
                backgroundColor: isUsingDefault ? '#f59e0b' : '#10b981',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '15px',
                lineHeight: '1.6',
                border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
                {isUsingDefault ? (
                    <div>
                        <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>📍 Using Default Location</div>
                        <div style={{ fontSize: '13px', color: '#fff', opacity: 0.95, lineHeight: '1.8' }}>
                            <div>Latitude: {DEFAULT_LATITUDE.toFixed(4)}°</div>
                            <div>Longitude: {DEFAULT_LONGITUDE.toFixed(4)}°</div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>✓ Location Detected</div>
                        <div style={{ fontSize: '13px', color: '#fff', opacity: 0.95, lineHeight: '1.8' }}>
                            <div>Latitude: {latitude?.toFixed(4)}°</div>
                            <div>Longitude: {longitude?.toFixed(4)}°</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div style={{ padding: '20px', paddingLeft: '340px' }}>
                <h1 style={{ color: '#ccc', textAlign: 'center', marginBottom: '30px' }}>Weather Forecast</h1>
                {loading ? (
                    <div style={{ color: '#fff', textAlign: 'center', padding: '40px', fontSize: '18px' }}>
                        ⏳ Loading weather data...
                    </div>
                ) : (
                    <WeatherChart data={weatherData} />
                )}
            </div>
        </div>
    );
}

export default App;