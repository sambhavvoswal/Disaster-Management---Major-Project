export const fetchWeatherData = async (lat, lon) => {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    // const apiKey = "6f311bfe90fccff4a47678dcc02627be";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};
