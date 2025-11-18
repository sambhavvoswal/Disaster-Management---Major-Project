import React, { useState, useEffect } from 'react';
import WeatherChart from './WeatherChart'; // Import the chart component from Step 3
import { transformWeatherData } from './DataTransformer'; // Import the function from Step 1

const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=16.1725&longitude=75.6557&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,rain&current=is_day';

function App() {
    const [weatherData, setWeatherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const rawData = await response.json();
                
                // Transform the raw API response
                const processedData = transformWeatherData(rawData);
                setWeatherData(processedData);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) return <div style={{color: '#fff', textAlign: 'center'}}>Loading weather data...</div>;
    if (error) return <div style={{color: 'red', textAlign: 'center'}}>Error: {error}</div>;

    return (
        <div className="App" style={{ backgroundColor: '#1e1e1e', minHeight: '100vh', padding: '20px' }}>
            <h1 style={{ color: '#ccc', textAlign: 'center' }}>Weather Forecast</h1>
            <WeatherChart data={weatherData} />
        </div>
    );
}

export default App;