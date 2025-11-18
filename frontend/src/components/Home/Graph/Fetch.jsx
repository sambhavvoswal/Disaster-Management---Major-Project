import React, { useState, useEffect } from 'react';
import WeatherChart from './WeatherChart.jsx';

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

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=16.1725&longitude=75.6557&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,rain&current=is_day';
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

        fetchWeather();
    }, []);

    if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>Loading weather data...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Error: {error}</div>;

    return (
        <div style={{ backgroundColor: '#1e1e1e', padding: '20px' }}>
            <h1 style={{ color: '#ccc', textAlign: 'center' }}>Weather Forecast</h1>
            <WeatherChart data={weatherData} />
        </div>
    );
};

export default Fetch;