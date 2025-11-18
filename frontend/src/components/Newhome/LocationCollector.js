/**
 * Fetches weather data from OpenWeather API using latitude and longitude
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @returns {Promise<Object>} - Weather data object
 */
export const fetchWeatherDataByLocation = async (latitude, longitude) => {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenWeather API key not found in environment variables');
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

/**
 * Extracts prominent weather properties for display
 * @param {Object} weatherData - Weather data from API
 * @returns {Array<Object>} - Array of weather metrics for display
 */
export const extractWeatherMetrics = (weatherData) => {
  if (!weatherData) return [];

  const tempCelsius = (weatherData.main.temp - 273.15).toFixed(2);
  const feelsLikeCelsius = (weatherData.main.feels_like - 273.15).toFixed(2);

  return [
    {
      title: 'Location',
      value: weatherData.name,
      status: weatherData.sys?.country || 'N/A'
    },
    {
      title: 'Temperature',
      value: `${tempCelsius}°C`,
      status: weatherData.weather[0]?.main || 'N/A'
    },
    {
      title: 'Feels Like',
      value: `${feelsLikeCelsius}°C`,
      status: weatherData.weather[0]?.description || 'N/A'
    },
    {
      title: 'Humidity',
      value: `${weatherData.main.humidity}%`,
      status: 'Moisture level'
    },
    {
      title: 'Wind Speed',
      value: `${weatherData.wind.speed} m/s`,
      status: 'Wind velocity'
    },
    {
      title: 'Pressure',
      value: `${weatherData.main.pressure} hPa`,
      status: 'Atmospheric pressure'
    },
    {
      title: 'Visibility',
      value: `${(weatherData.visibility / 1000).toFixed(2)} km`,
      status: 'Visibility range'
    },
    {
      title: 'Cloudiness',
      value: `${weatherData.clouds.all}%`,
      status: 'Cloud coverage'
    }
  ];
};
