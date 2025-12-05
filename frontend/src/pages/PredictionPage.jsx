import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { notificationService } from '../services/notificationService';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const PredictionPage = () => {
    // Add these state variables at the top of the component
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to center of India
    const [timeRange, setTimeRange] = useState(7); // Default to 7 days

    // Update the fetchPredictions function
    const fetchPredictions = async (lat, lng) => {
        try {
            setLoading(true);
            const response = await fetch(`http://127.0.0.1:8000/api/predictions?lat=${lat}&lng=${lng}`);
            if (!response.ok) {
                throw new Error('Failed to fetch predictions');
            }
            const result = await response.json();
            if (result.status === 'success') {
                setPredictions(result.data);
            }
        } catch (error) {
            console.error('Error fetching predictions:', error);
            notificationService.error('Failed to load predictions. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Add this effect for geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    setMapCenter([latitude, longitude]);
                    fetchPredictions(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Use default location if geolocation fails
                    fetchPredictions(20.5937, 78.9629);
                }
            );
        } else {
            // Browser doesn't support geolocation
            fetchPredictions(20.5937, 78.9629);
        }
    }, [timeRange]); // Refetch when time range changes

    // Update the return statement to include the time range selector and map
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Cyclone Predictions</h2>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Time Range:</span>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(Number(e.target.value))}
                        className="border rounded px-3 py-1 text-sm"
                    >
                        <option value={3}>Next 3 days</option>
                        <option value={7}>Next week</option>
                        <option value={14}>Next 2 weeks</option>
                    </select>
                </div>
            </div>

            <div className="mb-6 h-96 w-full rounded-lg overflow-hidden">
                <MapContainer
                    center={mapCenter}
                    zoom={5}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* User location marker */}
                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]}>
                            <Popup>
                                <div>
                                    <h4 className="font-bold">Your Location</h4>
                                    <p>Lat: {userLocation.lat.toFixed(4)}</p>
                                    <p>Lng: {userLocation.lng.toFixed(4)}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Cyclone prediction markers */}
                    {predictions.map((prediction, index) => {
                        const intensity = prediction.intensity.toLowerCase();
                        let iconColor = 'blue';

                        if (intensity.includes('category 3') || intensity.includes('category 4') ||
                            intensity.includes('category 5')) {
                            iconColor = 'red';
                        } else if (intensity.includes('category 1') || intensity.includes('category 2')) {
                            iconColor = 'orange';
                        } else if (intensity.includes('tropical storm')) {
                            iconColor = 'yellow';
                        }

                        return (
                            <Marker
                                key={index}
                                position={[prediction.coordinates.lat, prediction.coordinates.lng]}
                                icon={L.icon({
                                    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
                                    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                                    iconSize: [25, 41],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    shadowSize: [41, 41]
                                })}
                            >
                                <Popup>
                                    <div className="space-y-1">
                                        <h4 className="font-bold">{prediction.name}</h4>
                                        <p><span className="font-medium">Intensity:</span> {prediction.intensity}</p>
                                        <p><span className="font-medium">Predicted Time:</span> {new Date(prediction.predictedTime).toLocaleString()}</p>
                                        <p><span className="font-medium">Wind Speed:</span> {prediction.windSpeed}</p>
                                        <p><span className="font-medium">Status:</span> {prediction.status}</p>
                                        <p><span className="font-medium">Confidence:</span> {(prediction.confidence * 100).toFixed(1)}%</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* Prediction list */}
            {predictions.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Upcoming Cyclone Predictions</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {predictions.map((prediction, index) => (
                            <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg">{prediction.name}</h4>
                                        <p className="text-sm text-gray-600">{prediction.location}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${prediction.intensity.includes('Category 3') ||
                                            prediction.intensity.includes('Category 4') ||
                                            prediction.intensity.includes('Category 5')
                                            ? 'bg-red-100 text-red-800'
                                            : prediction.intensity.includes('Category 1') ||
                                                prediction.intensity.includes('Category 2')
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {prediction.intensity}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm space-y-1">
                                    <p><span className="font-medium">Predicted:</span> {new Date(prediction.predictedTime).toLocaleString()}</p>
                                    <p><span className="font-medium">Wind Speed:</span> {prediction.windSpeed}</p>
                                    <p><span className="font-medium">Status:</span> {prediction.status}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className="h-2 rounded-full bg-blue-600"
                                            style={{ width: `${prediction.confidence * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-right">
                                        Confidence: {(prediction.confidence * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictionPage;