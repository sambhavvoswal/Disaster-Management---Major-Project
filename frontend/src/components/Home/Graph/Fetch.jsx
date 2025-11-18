import React, { useState, useEffect } from 'react';
import WeatherChart from './WeatherChart.jsx';

// Default location (Hyderabad, India)
const DEFAULT_LATITUDE = 16.1725;
const DEFAULT_LONGITUDE = 75.6557;

/**
 * Transforms the raw Open-Meteo API response (with parallel arrays)
 * into an array of objects for Recharts.
 */
const transformWeatherData = (apiData) => {
    if (!apiData || !apiData.hourly || !apiData.hourly.time) {
        console.error("Invalid API data structure.");
        return [];
    }

    const hourly = apiData.hourly;
    const dataLength = hourly.time.length;
    const transformedData = [];

    for (let i = 0; i < dataLength; i++) {
        transformedData.push({
            time: hourly.time[i],
            temp: hourly.temperature_2m[i],
            humidity: hourly.relative_humidity_2m[i],
            apparentTemp: hourly.apparent_temperature[i],
            rainProb: hourly.precipitation_probability[i],
            rain: hourly.rain[i],
        });
    }

    return transformedData;
};

const Fetch = () => {
    const [weatherData, setWeatherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isUsingDefault, setIsUsingDefault] = useState(false);

    useEffect(() => {
        // Request user's geolocation
        if (navigator.geolocation) {
            const timeoutId = setTimeout(() => {
                // If no response after 5 seconds, use default location
                console.log('Location request timeout, using default location');
                setIsUsingDefault(true);
                fetchWeatherData(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
            }, 5000);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success: location granted
                    clearTimeout(timeoutId);
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setLatitude(lat);
                    setLongitude(lon);
                    setIsUsingDefault(false);
                    fetchWeatherData(lat, lon);
                },
                (error) => {
                    // Error: location denied, use default
                    clearTimeout(timeoutId);
                    console.error('Geolocation error:', error);
                    setIsUsingDefault(true);
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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (error) return <div className="text-red-500 text-center p-5">Error: {error}</div>;

    return (
        <div className="bg-gray-900 min-h-screen relative">
            {/* Main Content */}
            <div className="p-5">
                <h1 className="text-gray-300 text-center mb-8 text-3xl font-bold">Weather Forecast</h1>
                {loading ? (
                    <div className="text-white text-center py-10 text-lg">
                        ⏳ Loading weather data...
                    </div>
                ) : (
                    <WeatherChart data={weatherData} />
                )}
            </div>

            {/* Floating Notification - Bottom Right */}
            <div className={`fixed bottom-8 right-8 w-80 p-5 rounded-xl shadow-2xl border-2 border-white border-opacity-20 font-bold text-base leading-relaxed z-50 ${
                isUsingDefault ? 'bg-amber-500' : 'bg-emerald-500'
            } text-white`}>
                {isUsingDefault ? (
                    <div>
                        <div className="mb-3 text-lg font-bold">📍 Using Default Location</div>
                        <div className="text-sm text-white text-opacity-95 leading-loose">
                            <div>Latitude: {DEFAULT_LATITUDE.toFixed(4)}°</div>
                            <div>Longitude: {DEFAULT_LONGITUDE.toFixed(4)}°</div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-3 text-lg font-bold">✓ Location Detected</div>
                        <div className="text-sm text-white text-opacity-95 leading-loose">
                            <div>Latitude: {latitude?.toFixed(4)}°</div>
                            <div>Longitude: {longitude?.toFixed(4)}°</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Fetch;